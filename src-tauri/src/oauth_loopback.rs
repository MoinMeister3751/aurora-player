use serde::Serialize;
use tauri::{AppHandle, Emitter};
use tiny_http::{Response, Server};
use url::Url;

#[derive(Clone, Serialize)]
pub struct OAuthCallbackPayload {
    code: Option<String>,
    state: Option<String>,
    error: Option<String>,
}

const SUCCESS_HTML: &str = r#"<!doctype html>
<html><head><meta charset="utf-8"><title>Aurora</title>
<style>
  body{background:#0a0a0c;color:#f2f2f3;font-family:system-ui,sans-serif;
       display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
  div{text-align:center}
  h1{font-weight:600;font-size:1.4rem;margin-bottom:.5rem}
  p{color:#9a9aa2}
</style></head>
<body><div><h1>Anmeldung erfolgreich</h1><p>Du kannst dieses Fenster jetzt schließen und zu Aurora zurückkehren.</p></div></body></html>"#;

const ERROR_HTML: &str = r#"<!doctype html>
<html><head><meta charset="utf-8"><title>Aurora</title>
<style>
  body{background:#0a0a0c;color:#f2f2f3;font-family:system-ui,sans-serif;
       display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
  div{text-align:center}
  h1{font-weight:600;font-size:1.4rem;margin-bottom:.5rem;color:#f87171}
  p{color:#9a9aa2}
</style></head>
<body><div><h1>Anmeldung fehlgeschlagen</h1><p>Bitte kehre zu Aurora zurück und versuche es erneut.</p></div></body></html>"#;

/// Starts a one-shot HTTP server on 127.0.0.1:<port> to catch the Spotify
/// PKCE redirect. Blocks the calling (spawned) thread until a request
/// carrying an OAuth `code`/`state`/`error` query param arrives, then emits
/// it to the frontend as an `oauth://callback` event and shuts the server
/// down.
///
/// The redirect URI's path must match what's registered in the Spotify
/// Developer Dashboard exactly (Spotify rejects any mismatch). Both the
/// bare root path (`http://127.0.0.1:<port>`) and a `/callback` suffix are
/// accepted here so either dashboard configuration works without a code
/// change; anything else (e.g. a stray `/favicon.ico` request) is ignored
/// and does not consume the one-shot listener.
///
/// Using the system browser + a loopback listener (RFC 8252) instead of an
/// embedded webview keeps the app from ever touching the user's Spotify
/// credentials directly.
#[tauri::command]
pub async fn start_oauth_loopback(app: AppHandle, port: u16) -> Result<(), String> {
    let server = Server::http(format!("127.0.0.1:{port}"))
        .map_err(|e| format!("could not bind loopback server on port {port}: {e}"))?;

    tauri::async_runtime::spawn_blocking(move || {
        for request in server.incoming_requests() {
            let url_str = format!("http://127.0.0.1:{port}{}", request.url());
            let parsed = Url::parse(&url_str).ok();
            let is_callback = parsed.as_ref().map_or(false, |u| {
                let path = u.path().trim_end_matches('/');
                (path.is_empty() || path == "/callback")
                    && u.query_pairs().any(|(k, _)| matches!(k.as_ref(), "code" | "error"))
            });

            if !is_callback {
                let _ = request.respond(Response::from_string("Not Found").with_status_code(404));
                continue;
            }

            let mut code = None;
            let mut state = None;
            let mut error = None;

            if let Some(u) = parsed {
                for (k, v) in u.query_pairs() {
                    match k.as_ref() {
                        "code" => code = Some(v.to_string()),
                        "state" => state = Some(v.to_string()),
                        "error" => error = Some(v.to_string()),
                        _ => {}
                    }
                }
            }

            let html = if error.is_some() { ERROR_HTML } else { SUCCESS_HTML };
            let response = Response::from_string(html)
                .with_header("Content-Type: text/html; charset=utf-8".parse::<tiny_http::Header>().unwrap());
            let _ = request.respond(response);

            let _ = app.emit(
                "oauth://callback",
                OAuthCallbackPayload { code, state, error },
            );

            // One-shot server: stop listening after the first callback.
            break;
        }
    })
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

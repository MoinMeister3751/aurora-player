// Stores the Spotify refresh token in the Windows Credential Manager via
// direct Win32 calls rather than the `keyring` crate. `keyring` (both v3
// and v4's Windows backend) writes credentials with CRED_PERSIST_ENTERPRISE,
// which on this kind of setup (Microsoft-account-linked, no roaming
// completing) reports a successful write that then doesn't actually persist
// past process exit — confirmed by writing in one process and failing to
// read it back in a freshly spawned one. CRED_PERSIST_LOCAL_MACHINE fixes
// that: it's still DPAPI-protected and scoped to this Windows user account,
// just without the enterprise-roaming dependency.
use windows::core::PCWSTR;
use windows::Win32::Foundation::FILETIME;
use windows::Win32::Security::Credentials::{
    CredDeleteW, CredFree, CredReadW, CredWriteW, CREDENTIALW, CRED_FLAGS,
    CRED_PERSIST_LOCAL_MACHINE, CRED_TYPE_GENERIC,
};

const TARGET: &str = "com.aurora.player/spotify-refresh-token";
const USERNAME: &str = "spotify-refresh-token";

fn to_wstr(s: &str) -> Vec<u16> {
    s.encode_utf16().chain(std::iter::once(0)).collect()
}

#[tauri::command]
pub fn save_refresh_token(token: String) -> Result<(), String> {
    let mut target = to_wstr(TARGET);
    let mut username = to_wstr(USERNAME);
    let mut blob = token.into_bytes();

    let credential = CREDENTIALW {
        Flags: CRED_FLAGS(0),
        Type: CRED_TYPE_GENERIC,
        TargetName: windows::core::PWSTR(target.as_mut_ptr()),
        Comment: windows::core::PWSTR::null(),
        LastWritten: FILETIME::default(),
        CredentialBlobSize: blob.len() as u32,
        CredentialBlob: blob.as_mut_ptr(),
        Persist: CRED_PERSIST_LOCAL_MACHINE,
        AttributeCount: 0,
        Attributes: std::ptr::null_mut(),
        TargetAlias: windows::core::PWSTR::null(),
        UserName: windows::core::PWSTR(username.as_mut_ptr()),
    };

    let result = unsafe { CredWriteW(&credential, 0) };
    blob.fill(0);
    result.map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_refresh_token() -> Result<Option<String>, String> {
    let target = to_wstr(TARGET);
    unsafe {
        let mut p_credential: *mut CREDENTIALW = std::ptr::null_mut();
        let result = CredReadW(PCWSTR(target.as_ptr()), CRED_TYPE_GENERIC, None, &mut p_credential);
        match result {
            Ok(()) => {
                let credential = &*p_credential;
                let slice = std::slice::from_raw_parts(
                    credential.CredentialBlob,
                    credential.CredentialBlobSize as usize,
                );
                let token = String::from_utf8_lossy(slice).into_owned();
                CredFree(p_credential as *const _);
                Ok(Some(token))
            }
            Err(e) if e.code() == windows::Win32::Foundation::ERROR_NOT_FOUND.to_hresult() => {
                Ok(None)
            }
            Err(e) => Err(e.to_string()),
        }
    }
}

#[tauri::command]
pub fn delete_refresh_token() -> Result<(), String> {
    let target = to_wstr(TARGET);
    unsafe {
        match CredDeleteW(PCWSTR(target.as_ptr()), CRED_TYPE_GENERIC, None) {
            Ok(()) => Ok(()),
            Err(e) if e.code() == windows::Win32::Foundation::ERROR_NOT_FOUND.to_hresult() => {
                Ok(())
            }
            Err(e) => Err(e.to_string()),
        }
    }
}

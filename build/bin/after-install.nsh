!include "FileFunc.nsh"
!include "WinMessages.nsh"

!addplugindir /x86-unicode "${BUILD_RESOURCES_DIR}\nsis\Plugins\x86-unicode"

!macro customInstall
  ; 1) append $INSTDIR\bin to PATH (HKCU – only for current user)
  EnVar::SetHKCU
  EnVar::AddValue "PATH" "$INSTDIR\bin"
  Pop $0  ; $0 = status (OK/ERR)
  System::Call 'USER32::SendMessageTimeoutW(i 0xffff, i ${WM_SETTINGCHANGE}, i 0, t "Environment", i 0, i 5000, *i .r0)'

  ; 2) create folder in Start Menu
  CreateDirectory "$SMPROGRAMS\Web-Pane"

  ; 3) example activators (with arguments)

  ; ChatGPT (right)
  CreateShortCut "$SMPROGRAMS\Web-Pane\ChatGPT (right).lnk" "$INSTDIR\web-pane.exe" \
    "--url https://chatgpt.com --target right"
!macroend

!macro customUnInstall
  ; PATH clean up
  EnVar::SetHKCU
  EnVar::DeleteValue "PATH" "$INSTDIR\bin"
  Pop $0
  System::Call 'USER32::SendMessageTimeoutW(i 0xffff, i ${WM_SETTINGCHANGE}, i 0, t "Environment", i 0, i 5000, *i .r0)'

  ; usuń folder skrótów
  RMDir /r "$SMPROGRAMS\Web-Pane"
!macroend

Option Explicit
Dim shell, fso, dir
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
On Error Resume Next
shell.Run "pythonw """ & dir & "\launch.pyw"" --stop", 0, False
If Err.Number <> 0 Then MsgBox "Cannot start Python. Please enable pythonw in PATH.", 16, "Fanya"

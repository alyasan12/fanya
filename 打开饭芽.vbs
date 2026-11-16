Option Explicit
Dim shell, fso, dir, command
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
command = "pythonw """ & dir & "\launch.pyw"""
On Error Resume Next
shell.Run command, 0, False
If Err.Number <> 0 Then
  MsgBox "Cannot start Python. Please install Python with Tkinter and enable pythonw in PATH.", 16, "Fanya"
End If

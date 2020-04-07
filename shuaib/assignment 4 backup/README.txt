
How to run?
	-As soon the server is fired
		type " localhost:2000/visitor.html " for visitor part 
			and
		type " localhost:2000/resident.html" for resident part
	-port number used: 2000


For error:
 	Error: listen EADDRINUSE: address already in use :::2000 "

solution:
	Run cmd.exe as 'Administrator':
	C:\Windows\System32>taskkill /F /IM node.exe
	SUCCESS: The process "node.exe" with PID 11008 has been terminated.

Note:
You cannot edit/update the "Name" of the visitor/resident.Only other information related to the visitor/resident is editable eg Host, Destination ,Time etc 
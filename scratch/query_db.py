import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('84.46.243.59', username='root', password='GgCXXuFM5H40Yj4uv')

py_cmd = "python3 -c \"import sqlite3; conn=sqlite3.connect('/var/www/sop-academy/server/prisma/dev.db'); cursor=conn.cursor(); cursor.execute('SELECT id, name, email, role, purchasedAudios FROM User'); [print(row) for row in cursor.fetchall()]; conn.close()\""
stdin, stdout, stderr = ssh.exec_command(py_cmd)
print("Users:")
print(stdout.read().decode())
print("Errors:")
print(stderr.read().decode())

ssh.close()

# Drop foreign key with Entity Framework for SQL Lite

At this moment net core 2.1. build 302 you cannot drop foreign key with SQL Lite. If you try to run 
```
$ dotnet ef database update
```

ef will throw this error:

SQLite does not support this migration operation ('DropForeignKeyOperation')

The cause is that SQLLite EF Core has limitations: https://docs.microsoft.com/en-us/ef/core/providers/sqlite/limitations

As an alternative, you can reset database by doing the following:


Open possible solution to avoid DropForeignKeyOperation error in SQL Lite is to reset your database, and start a new migration from scratch. 

Here some steps that have worked with me:
 
1) Close any connection opened with DB Browser SQL Lite 

2) Stop the project if it is running
```
CTRL + C
```

3) Drop the current database
```
dotnet ef database drop -f
```

4) I have noticed that somehow the migration code was being generated for a User table, but we were using a table named Users in this course. So if you want to keep the table name as Users, add a data annotation at DatingApp.API.Models.User class:
```
//tells ef core to name User table as Users
[Table("Users")]
public class User
``` 

5) Generate a new migration code and update the database
```
dotnet ef migrations add ModelReset
dotnet ef database update
```

6) At Startup Configure method uncomment the code to seed database
```
seeder.SeedUsers()
```

7) Run the DatingApp.API project
```
dotnet watch run
```

8) Comment the seed again at Startup Configure
```
//seeder.SeedUsers()
```

# Add SSL self signed certificate to .NET Core

## Create the certificate
- Run gitbash
- create a self signed certificate
```
$ openssl pkcs12 -export -out webapi.pfx -inkey server.key -in server.crt
```

- create a pfx for webapi with no pass
```
$ winpty openssl pkcs12 -export -out webapi.pfx -inkey server.key -in server.crt
Enter Export Password:
Verifying - Enter Export Password:
```

then in startup.cs customize kestrel to call pfx file
```
.UseKestrel(options => {
      options.Listen(IPAddress.Loopback, 5001, listenOptions => {
      listenOptions.UseHttps(@"webapi.pfx","");
      });
});
```

Go to chrome://settings/?search=certificate, Manage Certificates, export the "localhost" certificates at "Certificates-> Personal", and reimport them into "Trusted Root Certification authorities". This will make ERR_CERT_AUTHORITY_INVALID error on OPTIONS verb go away on when using angular's http.post method.

https://superuser.com/questions/1083766/how-do-i-deal-with-neterr-cert-authority-invalid-in-chrome

## Error
If you do not install a SSL certificate, WebAPI will throw this error: 

dbug: HttpsConnectionAdapter[1]
      Failed to authenticate HTTPS connection.
System.IO.IOException: Authentication failed because the remote party has closed the transport stream.


# Add a powershell terminal
- Type CTRL Shift P
- Choose Terminal: Select Default Shell
- Select Powershell
- Click on + icon to add powershell terminal

# Deployment

## Create resources at Azure

- SQL server
- SQL Database
- App Service plan
- App Service (setup Application settings, Connection string, Create deployment Credentials and enable Local git at Deployment Center)

## Reset git within DatingApp.API folder

```
git init
git add .
git commit -m 'commit for azure'
```

## Clone remote git URL

```
git remote add azure https://youruser@youappservice.scm.azurewebsites.net:443/youappservice.git
git push azure master
```

## Visit url address at App Service | Overview

```
https://yourappservice.azurewebsites.net/
```
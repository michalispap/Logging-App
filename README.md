# Logging-App

A login application implemented with Node.js framework and a MySQL database. The backend system authenticates users preventing SQL Injection and Brute-force attacks and also reminds users to change their password after a certain amount of time. The database contains two tables: The users table, where the passwords are kept in a secure hash format (SHA-256) in case of a data breach and a logging table, which keeps track of every successful login attempt, along with its timestamp.

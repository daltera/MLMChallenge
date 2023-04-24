# MLM Challenge

This project is made as a response to Forex IMF Test. It contains the functionality required with modifications where it seems logical

1. The web features all the functions, to calculate user's profit, insert new members as a downline of others or as an upline (downline to admin), and migrate a user as a downline to other users or as a new upline (downline to admin).
2. The level selection on the bonus calculation is removed as it's considered redundant and adds no additional functionality
3. Migration cannot be performed between a parent to a child. The program will verify and offer only valid parent options
4. The graph displays member names and their levels, however they do not display their profits to reduce redundancy.
5. Website is programmed to reload as soon as updates are committed to the database to show changes in the graph

# Requirements

1. MariaDB 10.4 
2. Node v. 16 and up

# How to Install

1. Clone this repository
2. Go to the `dbDump` folder and load the Database dump into your MySQL engine, mine is `10.4.25-MariaDB`
3. Rename the `.env.example` to `.env` and fill the values with your local machine's setup
3. Go to the `server` folder and run `npm install`
4. Within the `server` folder run `node server`
5. You can then test the project by running it from `index.html` located at the project's root directory.
6. You can try inserting, migrating, and calculating bonuses for your participants.

# Expected Output

![alt text](https://raw.githubusercontent.com/daltera/MLMChallenge/master/assets/demo/demo.png)

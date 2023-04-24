var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var mysql = require('mysql')
var dotenv = require('dotenv').config()

var dbConn = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: 'MLMChallenge',
  multipleStatements: true,
  port: 3306
})

dbConn.connect()
app.use(bodyParser.json({limit: '5mb'}))
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '5mb'
}))

app.use(function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  next()
})

function cascadeChange(req, res, children, level){
  let updateKidsQuery = `UPDATE members SET level = ${level}  WHERE id = ${children[0]}`
  if (children === ''){
    return res.status(200).send({message: "Success", newLevel: res.newLevel})
  } else {
    let arr = children.split(',')
    arr.forEach(el => updateKidsQuery += ` OR id = ${el}`)
    dbConn.query(updateKidsQuery, function(error, results, fields){
      if (error){
        return res.status(400).send(error)
      } else {
        let selectDeeperKidsQuery = `SELECT children FROM members WHERE id = ${children[0]}`
        arr.forEach(el => selectDeeperKidsQuery += ` OR id = ${el}`)        
        dbConn.query(selectDeeperKidsQuery, function(error, results, fields){
          if (error){
            return res.status(400).send(error)
          } else {
            let furtherKids = []
            for (let i = 0; i < results.length; i++){
              if (results[i].children === ''){

              } else {
                let kidsToPush = results[i].children.split(',')
                kidsToPush.forEach(el => furtherKids.push(el))
              }
            }

            let newKidsString = furtherKids.join(',')
            return cascadeChange(req, res, newKidsString, level + 1)
          }
        })
      }
    })
  }
}

function verifyValidity(req, res, children, next){
  let arrayChildren = children.split(',')
  if (children === ''){
    return next()
  } else if (arrayChildren.includes(req.body.newParent)) {
    return res.status(400).send({message: `New parent is current element's child, move the new parent first!`})
  } else {
    let selectDeeperKidsQuery = `SELECT children FROM members WHERE id = ${arrayChildren[0]}`
    arrayChildren.forEach(el => selectDeeperKidsQuery += ` OR id = ${el}`)        
    dbConn.query(selectDeeperKidsQuery, function(error, results, fields){
      if (error){
        return res.status(400).send(error)
      } else {
        let furtherKids = []
        for (let i = 0; i < results.length; i++){
          if (results[i].children === ''){

          } else {
            let kidsToPush = results[i].children.split(',')
            kidsToPush.forEach(el => furtherKids.push(el))
          }
        }

        let newKidsString = furtherKids.join(',')
        return verifyValidity(req, res, newKidsString, next)        
      }
    })
  }
}

app.post('/update', function(req, res, next){
  let oldParentQuery = `SELECT parent, children, level FROM members WHERE id = ${req.body.id}`
  dbConn.query(oldParentQuery, function(error, results, fields){
    if (error){
      return res.status(400).send(error)
    } else {
      req.body.oldParent = results[0].parent
      req.body.childrenToChange = results[0].children
      req.body.currentLevel = results[0].level
      verifyValidity(req, res, results[0].children, next)
    }
  })
}, 
function(req, res){
  let id = req.body.id
  let newParent = req.body.newParent
  let query = `SELECT id, children, level FROM members WHERE id = ${newParent} OR id = ${req.body.oldParent}`
  dbConn.query(query, function(error, results, fields){
    if (error){
      return res.status(400).send(error)
    } else {
      let newChildren = ''
      let oldParentIdx = parseInt(results[0].id) === parseInt(req.body.oldParent) ? 0 : 1
      let newParentIdx = oldParentIdx === 0 ? 1 : 0 
      if (results[newParentIdx].children === ''){
        newChildren = id
      } else {
        newChildren = results[newParentIdx].children.split(',')
        newChildren.push(id)
        newChildren = newChildren.join(',')
      }
      let queryToAppend = ''
      if (results[oldParentIdx].children.split(',').length === 1){
        queryToAppend = `children = ''`
      } else {
        let tempArr = results[oldParentIdx].children.split(',')
        tempArr.splice(tempArr.indexOf(req.body.id), 1)
        queryToAppend = `children = "${tempArr.join(',')}"`
      }

      let newLevel = results[newParentIdx].level

      let updateQuery = `UPDATE members SET children = "${newChildren}" WHERE id = ${newParent}; UPDATE members SET ${queryToAppend} WHERE id = ${req.body.oldParent}; UPDATE members SET level = ${results[newParentIdx].level + 1}, parent = ${newParent} WHERE id = ${id}`
      dbConn.query(updateQuery, function(error, results, fields){
        if (error){
          return res.status(400).send(error)
        } else {
          res.newLevel = newLevel + 1
          return cascadeChange(req, res, req.body.childrenToChange, newLevel + 2)
        }
      })
    }
  })
})


app.get('/bonus/:id', function(req, res){
  let id = req.params.id
  let query = `SELECT children FROM members WHERE id = ${id}`
  dbConn.query(query, function(error, results, fields){
    if (error){
      return res.status(400).send(error)
    } else {
      if (results[0].children === ''){
        return res.status(200).send({profit: 0})
      } else {
        let children = results[0].children.split(',')
        let currentProfit = children.length * 1
        let levelTwoQuery = `SELECT count(id) AS sum FROM members WHERE parent = ${children[0]}`
        let i = 1
        while (i < children.length){
          levelTwoQuery += ` OR parent = ${children[i]}`
          i += 1
        }
        dbConn.query(levelTwoQuery, function(error, results, fields){
          if (error){
            return res.status(400).send(error)
          } else {
            currentProfit += (results[0].sum * 0.5)
            return res.status(200).send({profit: currentProfit})
          }
        })
      }

    }
  })
})

app.post('/insert', function(req, res){
  let selectQuery = `SELECT * FROM members WHERE id = ${req.body.parent}`
  dbConn.query(selectQuery, function(error, results, fields){
    if (error){
      console.log(error)
      return res.status(400).send(error)
    } else {
      let insertQuery = `INSERT INTO members(initial, parent, children, level) VALUES ("${req.body.initial}", "${req.body.parent}", "", ${parseInt(results[0].level) + 1})`
      let childrenRecord = results[0].children
      dbConn.beginTransaction(function(err){
        if (err){ return res.status(400).send(error) }
        dbConn.query(insertQuery, function(error, results, fields){
          if (error){
            console.log(error)
            dbConn.rollback(function(){
              throw error
            })
          } else {
            let children = childrenRecord === '' ?  [...childrenRecord] : childrenRecord.split(',')
            children.push(results.insertId)
            children = children.join(',')
            let updateQuery = `UPDATE members SET children = "${children}" WHERE id = ${req.body.parent}`
            let insert = results.insertId
            dbConn.query(updateQuery, function(error, results, fields){
              if (error){
                console.log(error)
                dbConn.rollback(function(){
                  throw error
                })
              } else {
                dbConn.commit(function(err){
                  if (err){
                    dbConn.rollback(function(){
                      throw err
                    })
                  } else {
                    results.member_id = insert
                    return res.status(200).send(results)
                  }
                })
              }
            })
          }
        })
      })

    }
  })
  

})

app.get('/', function(req, res){
  let query = `SELECT * FROM members`
  dbConn.query(query, function(error, results, fields){
    if (error){
      console.log(error)
    } else {
      return res.status(200).send(results)
    }
  })
})


app.listen(3000, function(){
  console.log('Node app is running on port 3000')
})

module.exports = app;

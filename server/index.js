const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bcrypt = require('bcrypt'); 
const saltRounds = 10;
const app = express();
const multer = require('multer')
const csvtojson = require('csvtojson');
const Axios = require('axios');
const getUnixTime = require('date-fns/getUnixTime')
const _ = require('lodash');
const statistics = require('./services/statistics');
const mysql2 = require('mysql2/promise');
const bluebird = require('bluebird');
require('dotenv').config();




/* Express
--------------------------------------------
--------------------------------------------
--------------------------------------------*/
app.use(express.json());

/* Middleware */
// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', process.env.URL);

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});



app.use(cors({
    //origin: [env_url],
    origin: process.env.URL,
    methods: ["GET", "POST", "PUT"],
    credentials: false
}));


/* Session 
--------------------------------------------
--------------------------------------------
--------------------------------------------*/
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    key: "userId",
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    // cookie: {
    //     expires: 60 * 60 * 24,
    // }
}))




/* Database Connection 
--------------------------------------------
--------------------------------------------
--------------------------------------------*/
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

let database = null


async function initializeDatabase() {
    database = await mysql2.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        Promise: bluebird
    });
}

initializeDatabase()


/* Registration 
--------------------------------------------
--------------------------------------------
--------------------------------------------*/
app.post('/register', (req, res)=>{
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err)
        }
        db.query(
            "INSERT INTO members (email, username, password) VALUES (?,?,?)", 
            [email, username, hash], 
            (err, result)=>{
                if(err){
                    console.log(err)
                    res.send(err);
                } else {
                    console.log(result)
                    res.send(result);
                }
            }
        );
    });
});

/* Get Patterns
--------------------------------------------
--------------------------------------------
--------------------------------------------*/
app.get('/patterns', (req, res) => {

    db.query("SELECT * FROM patterns", [], (err, result) => res.send(result))
}) 


/* Get Statistics
--------------------------------------------
--------------------------------------------
--------------------------------------------*/
app.get('/statistics', (req, res) => {

    db.query("SELECT * FROM statistics ORDER BY date_in", [], (err, result) => res.send(result))
}) 


/* Get Statistic
--------------------------------------------
--------------------------------------------*/
app.get('/statistic', (req, res) => {
    db.query("SELECT * FROM statistics WHERE symbol = ? AND date_in = ? date_out = ? ORDER BY date_in", [req.body.symbol, req.body.date_in, req.body.date_out], (err, result) => res.send(result))
}) 


/* Add Statistic
--------------------------------------------
--------------------------------------------
--------------------------------------------*/
app.post('/add_statistic', (req, res)=>{
    db.query(
        "INSERT INTO statistics (symbol, date_in, profit_loss) VALUES (?,?,?)", 
        [req.body.symbol, req.body.date_in, req.body.profit_loss], 
        (err, result)=>{
            if(err){
                console.log(err)
                res.send(err);
            } else {
                console.log(result)
                res.send(result);
            }
        }
    );
});


/* Check if Logged In
--------------------------------------------
--------------------------------------------
--------------------------------------------*/
app.get("/isLoggedIn", (req, res) => {
    if(req.session.user) {
        res.send(req.session.user);
    } else {
        res.send(false);
    }
})


/* Login Service
--------------------------------------------
--------------------------------------------
--------------------------------------------*/
app.post('/login', (req, res) => {
    // values
    const username = req.body.username;
    const password = req.body.password;
    db.query(
        "SELECT * FROM members WHERE username = ?",
        username,
        // Query Call Back
        (err, result) => {
            // Error?
            if(err) {
                res.send({ err: err })
            }
            // Send Response
            result = result || []
            if (result.length > 0) {
                // Check Password
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if (response) {
                        // Create User Session
                        let user = result[0];
                        user.password = true;
                        req.session.user = user; 
                        // Response
                        res.send(user);
                    } else {
                        res.send({ message: "Incorrect username and password combination."});
                    }
                })
            } else {
                res.send({ message: "Incorrect username."}); 
            }
        }
    );
});


/* Get Logout 
--------------------------------------------
--------------------------------------------
--------------------------------------------*/
app.get("/logout", (req, res) => {
    //res.clearCookie("userId");
    req.session.destroy();
    res.send({ message: "Logged Out"})    
})


/* Upload CSV
--------------------------------------------
--------------------------------------------
--------------------------------------------*/
app.post('/upload-csv',function(req, res) {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/csv')
            // cb(null, '/home/tradegri/public_html/uploads/csv/')
        },
        filename: function (req, file, cb) { 
            cb(null, Date.now() + '-' +file.originalname )
        }
    })
    let upload = multer({ storage: storage }).single('file')
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        await InsertCsvData(req, res);
    })
});


/* Insert CSV Data
--------------------------------------------
--------------------------------------------
--------------------------------------------*/
const formatDate = (date)=>{
    let mysqlDate = new Date(date);
    mysqlDate = mysqlDate.toISOString().split("T")[0];
    return mysqlDate;
}
const InsertCsvData = async (req, res) => {
    
    await database.beginTransaction()
    try {
        let tradesSkipped = 0;
        let tradesEntered = 0;

        // All Columns
        const userColumns = ["member_id"];
        const csvColumns = ["account", "td", "sd", "currency", "type", "side", "symbol", "qty", "price", "exec_time", "comm", "sec", "taf", "nscc", "nasdaq", "ecn_remove","ecn_add","gross_proceeds","net_proceeds", "clr_broker", "liq", "note", "trade_qty", "trade_id"];
        const allColumns = userColumns.concat(csvColumns);
        const securityQuestionMarks = allColumns.map(el=>{return "?"}).toString();

        const sources = await csvtojson({
            noheader:false,
            headers:csvColumns
        }).fromFile("uploads/csv/" + req.file.filename)

        for (const source of sources) {
            let trade_qty = 0
            let trade_id = 0

            const [rows] = await database.execute("SELECT * FROM executions WHERE member_id = ? AND symbol = ? ORDER BY id DESC LIMIT 1", [req.session.user.id, source.symbol])
            let previousExecution = rows[0]
            if(!previousExecution || previousExecution.trade_qty == 0){
                const insertTrade = await database.execute("INSERT INTO trades(member_id, date_in, symbol) VALUES (?,?,?)", [req.session.user.id, formatDate(source.td), source.symbol])
                trade_id = insertTrade[0].insertId
                trade_qty = source.qty
            } else {
                trade_id = previousExecution.trade_id
                if(source.side == 'B' || source.side == 'SS'){
                    trade_qty = previousExecution.trade_qty + Number(source.qty);
                } else {
                    trade_qty = previousExecution.trade_qty - Number(source.qty);
                }
            }

            await database.execute("INSERT INTO executions ("+allColumns.toString()+") VALUES ("+securityQuestionMarks+")", [
                req.session.user.id,
                source.account,
                formatDate(source.td),
                formatDate(source.sd),
                source.currency,
                source.type,
                source.side,
                source.symbol,
                source.qty,
                source.price,
                source.exec_time,
                source.comm,
                source.sec,
                source.taf,
                source.nscc,
                source.nasdaq,
                source.ecn_remove,
                source.ecn_add,
                source.gross_proceeds,
                source.net_proceeds,
                source.clr_broker,
                source.liq,
                source.note,
                trade_qty,
                trade_id
            ])
            console.log("insert execution", trade_id, source.symbol, formatDate(source.td), source.exec_time, source.side, source.qty, "=", trade_qty)

            tradesEntered++
        }

        await database.commit()

        res.send({
            message: "Upload Recieved!",
            trades: {
                entered: tradesEntered
            }
        })
    
    } catch (e) {
        console.error('Failed to upload CSV Error : ', e)
        database.rollback()
        return res.send({
            message: "Upload failed"
        }, 500)
    }
}






/* Get Trade Dashboard
--------------------------------------------
--------------------------------------------*/
app.post("/dashboardGet", (req, res) => {    
    db.query("SELECT *, DATE_FORMAT(td,'%m-%d-%Y') AS tdFormatted, DATE_FORMAT(sd,'%d/%m/%Y') AS sd2 FROM executions WHERE member_id = ? AND td >= ? AND td <= ? ORDER BY td DESC", 
        [req.session.user.id, req.body.startDate, req.body.endDate], 
        (err, result) => { 
            if(err) {res.send({ err: err })}
            result = result || []
            if (result.length) {   

                // Default Values
                let totalGrossProceeds = 0;
                let runningProfit = 0;    

                // Group Exectutions by Day and Get dayTotal
                const resultByDay = _.groupBy(result, e => e.tdFormatted.substring(0, 10));
                const daySummaryArr = _.map(resultByDay, (items, date) => {
                    
                    // Calculate Profit
                    let sumDayProfit = _.sum(
                        items.map((e)=>{
                            let num = (e.side=="BC" || e.side=="B" ? e.qty * e.price * -1 : e.qty * e.price);
                            totalGrossProceeds += num;
                            return num;
                        })
                    )
                    // Return Day Trade
                    
                    return { 
                        date: date,
                        symbols: _.uniq(items.map(e=>e.symbol)),
                        profit: sumDayProfit,
                        executions: items,
                        showChart: 'hi'
                    }
                });

                // {date: "10-06-2022", symbols: "PEGY", profit: 1933.503600000003,…}
                // {date: "10-06-2022", symbols: "FNGR", profit: 1933.503600000003,…}
                // {date: "10-06-2022", symbols: "PEGY"], profit: 1933.503600000003,…}
                // {date: "10-05-2022", symbols: ["KITT", "GTII", "PEGY"], profit: 241.41679999999997,…}
                // {date: "10-04-2022", symbols: ["AERC"], profit: -1550.1250000000027,…}
                // {date: "10-03-2022", symbols: ["FNGR", "GTII"], profit: 2125.8256999999985,…}


                
                // Create Reveresed Running Profit Array (with Running Profit)
                let calcRunningProfit = 0;
                let daySummaryArrReversed = _.reverse([...daySummaryArr]);
                daySummaryArrReversed.map((e, i)=> {
                    calcRunningProfit = calcRunningProfit + e.profit
                    daySummaryArrReversed[i].runningProfit = calcRunningProfit;
                })

                // Calculate Highest / Lowest Running Profit (for top chart)
                let runningProfitArr  = daySummaryArrReversed.map(e=>e.runningProfit);
                let runningProfitHigh = Math.max(...runningProfitArr);
                let runningProfitLow = Math.min(...runningProfitArr);

                // Send Grouped Trades to Client
                res.send({
                    'success': true,
                    'totalGrossProceeds': totalGrossProceeds, 
                    'daySummaryArrReversed': daySummaryArrReversed,
                    'runningProfitHigh': runningProfitHigh,
                    'runningProfitLow': runningProfitLow, 
                    'daySummaryArr': daySummaryArr,
                })
                
            } else {
                res.send({ success: false, message: 'no results'}); 
            }
        }
    );
})





/* Exectutions -------------*/
// return json object with all executions grouped by trades (qty driven), entry_date, exit_date, ticker


/* Get Trades
--------------------------------------------
--------------------------------------------


symbol
pattern
date in
date out
pice in
price out
profit / loss 
win / l

Get these into inputs in a form...



-------------------------------------------- */
app.post("/trades", (req, res) => {    
    db.query("SELECT *, DATE_FORMAT(td,'%m-%d-%Y') AS tdFormatted, DATE_FORMAT(sd,'%d/%m/%Y') AS sd2 FROM executions WHERE member_id = ? AND symbol=? AND td = ? ORDER BY exec_time", 
        [req.session.user.id, req.body.symbol, req.body.date], 
        (err, result) => {   
            // Vars
            let runningQty = 0;      

            // Group Trades by Exec Time Seconds
            const tradesCondensed = _.groupBy(result, e => e.exec_time.substring(0, 8));
            const trades = _.map(tradesCondensed, (e, i) => {
                let totalQty = _.sum(
                    e.map((e)=>{
                        return e.qty; 
                    })
                )
                // Calc Running Qty
                if (e[0].side == 'S' || e[0].side == 'BC') {runningQty -= totalQty};
                if (e[0].side == 'SS' || e[0].side == 'B') {runningQty += totalQty};
                if (runningQty == 0) {
                    // do something
                }
                return { 
                    symbol : e[0].symbol,
                    exec_time: e[0].exec_time,
                    price: e[0].price, ///////////////////////////// PRICE IS Wrong. should be avg. not index 0.
                    qty: totalQty,
                    side: e[0].side,
                    runningQty: runningQty,

                    
                    // date in 
                    // date out
                    // pice in
                    // price out
                    // profit / loss 
                    // win / l
                }
            })


            // Get Profit Loss 
            let profitLossSum = _.sum(result.map((e)=>{
                let profitLossSum = (e.side=="BC" || e.side=="B" ? e.qty * e.price * -1 : e.qty * e.price);
                return profitLossSum;
            }))
            

            // Send Grouped Trades to Client
            res.send({
                'success': true,
                'data': trades,
                'profitLoss': profitLossSum
            })            
        } 
    )
})


/* Delete All Trades
--------------------------------------------
--------------------------------------------
--------------------------------------------*/
app.get("/deleteTrades", (req, res) => {
    db.query("DELETE FROM executions WHERE member_id = ?",
        req.session.user.id,
        (err, result) => { if(err) {res.send({ err: err })}
            console.log(result);
        } 
    );
    db.query("DELETE FROM trades WHERE member_id = ?",
        req.session.user.id,
        (err, result) => { if(err) {res.send({ err: err })}
            console.log(result);
        } 
    );
});

    

/*  Chart Data FinnHUB 
--------------------------------------------
--------------------------------------------
//Axios.get("http://tradegrill.com:3000/chart_btbt_finnhub_1min.json")
--------------------------------------------*/
app.post("/viewChart2", (req, res) => {
    let key = "c5f4pu2ad3ib660qup10";
    let symbol = req.body.symbol;
    let resolution = req.body.resolution;
    let date_from = new Date(req.body.date_from).getTime() / 1000;
    let date_to = new Date(req.body.date_to).getTime() / 1000;
    // let date_from = new Date(req.body.date_from).getTime() / 1000 + 9.5*60*60; // Premarket
    // let date_to = new Date(req.body.date_from).getTime() / 1000  + 16*60*60;
    let url = "https://finnhub.io/api/v1/stock/candle?symbol="+symbol+"&resolution="+resolution+"&from="+date_from+"&to="+date_to+"&token="+key
    Axios.get(url).then(response => {
        response.data.t.map((e, i)=>{
            if(e[i] == '9:30') {
                console.log(i+' market open') 
            }
        })
        res.send({
            success : true, 
            data: response.data
        }
    )})
    .catch(error => res.send({success : false , message: error.message}))
})




/* Company Profile
--------------------------------------------
--------------------------------------------
--------------------------------------------*/
app.post("/companyprofile", (req, res) => {
    let key = "c5f4pu2ad3ib660qup10";
    let symbol = req.body.symbol;
    let url = "https://finnhub.io/api/v1/stock/profile2?symbol="+symbol+"&token="+key;
    Axios.get(url).then(response => {
        res.send({
            success : true, 
            data: response.data
        }
    )})
    .catch(error => res.send({success : false , message: error.message}))
})
  

/* Server Listener
--------------------------------------------------*/
app.listen(3001, () => {
    console.log('running on port 3001');
})


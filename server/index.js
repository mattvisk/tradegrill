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
const _ = require('lodash');
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
    res.setHeader('Access-Control-Allow-Origin', [process.env.URL]);

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
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

let database = null

async function initializeDatabase() {
    const connection = await mysql2.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        Promise: bluebird
    })

    return connection
}

const getDatabaseConnection = async () => {
    if (!database || database?.connection?._closing) {
        database = await initializeDatabase()
    }
    return database
}
getDatabaseConnection()

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




/* Save Pattern Trade
--------------------------------------------
--------------------------------------------
--------------------------------------------*/
app.post('/update-trade', async (req, res) => {
    const { pattern_id, trade_id } = req.body
    const [pattern] = await database.execute("SELECT * FROM patterns WHERE id = ? LIMIT 1", [pattern_id])

    if (!pattern[0]) {
        await database.execute(
            `UPDATE trades SET pattern_id = ? WHERE id IN ('${trade_id.join("','")}') AND member_id = ?`, 
            ["", req.session.user.id]
        )
    } else {
        await database.execute(
            `UPDATE trades SET pattern_id = ? WHERE id IN ('${trade_id.join("','")}') AND member_id = ?`, 
            [pattern[0].id, req.session.user.id]
        )
    }


    return res.status(200).send({
        message: "Trade updated"
    })
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
        "SELECT *, DATE_FORMAT(dashboard_date_from,'%m-%d-%Y') AS dashboard_date_from_nice FROM members WHERE username = ?",
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
            cb(null, process.env.UPLOAD_PATH)
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
const formatDateTime = (d)=>{
    let mysqlDate = new Date(d);
    return mysqlDate;
}
const InsertCsvData = async (req, res) => {
    try {
        // All Columns
        const userColumns = ["member_id"];
        const csvColumns = ["account", "td", "sd", "currency", "type", "side", "symbol", "qty", "price", "exec_time", "comm", "sec", "taf", "nscc", "nasdaq", "ecn_remove","ecn_add","gross_proceeds","net_proceeds", "clr_broker", "liq", "note", "trade_qty", "trade_id", "rolling_gross_proceeds"];
        const allColumns = userColumns.concat(csvColumns);
        const securityQuestionMarks = allColumns.map(()=>{return "?"}).toString();

        const executions = await csvtojson({
            noheader:false,
            headers:csvColumns
        }).fromFile(process.env.UPLOAD_PATH + req.file.filename)

        let dateShouldSkipped = []
        let totalImported = 0
        let totalSkipped = 0

        // Dates Should Skip
        const executionDates = Object.keys(_.groupBy(executions, execution => execution.td))
        for (const date of executionDates) {
            const [checkExecDate] = await database.execute("SELECT * FROM executions WHERE member_id = ? AND td = ? ORDER BY id DESC LIMIT 1", [req.session.user.id, formatDate(date)])
            if (checkExecDate[0]) {
                dateShouldSkipped.push(date)
            }
        }

        // Loop though Executions 
        for (const execution of executions) {
            let trade_qty = 0
            let trade_id = 0

            // Skip Duplicates Executions
            if (dateShouldSkipped.includes(execution.td)) {
                totalSkipped++
                continue;
            }

            // Get Previous Execution
            const [rows] = await database.execute(
                "SELECT * FROM executions WHERE member_id = ? AND symbol = ? AND td <= ? ORDER BY id DESC LIMIT 1", 
                [req.session.user.id, execution.symbol, formatDate(execution.td)]
            )
            let previousExecution = rows[0]

            // Add Executions to New Trade...
            if(!previousExecution || previousExecution.trade_qty == 0){
                const insertTrade = await database.execute(
                    "INSERT INTO trades(member_id, date_in, symbol, side, starter, time_in) VALUES (?,?,?,?,?,?)", 
                    [req.session.user.id, formatDate(execution.td), execution.symbol, execution.side, execution.qty * execution.price, formatDateTime(execution.td+' '+execution.exec_time)]
                )
                trade_id = insertTrade[0].insertId
                trade_qty = execution.qty
                rolling_gross_proceeds = Number(execution.gross_proceeds);

            // Add Executions to Existing Trade...
            } else {
                trade_id = previousExecution.trade_id
                trade_qty = previousExecution.trade_qty + Number(execution.qty) * (execution.side == 'B' || execution.side == 'SS' ? 1 : -1);
                rolling_gross_proceeds = Number(previousExecution.rolling_gross_proceeds) + Number(execution.gross_proceeds);

                // Complete Trade
                if(trade_qty == 0){
                    await database.execute(
                        "UPDATE trades SET profit_loss = ?, date_out = ?, time_out=? WHERE id = ? AND member_id = ?", 
                        [rolling_gross_proceeds, formatDate(execution.td), formatDateTime(execution.td+' '+execution.exec_time), trade_id, req.session.user.id]
                    )
                }
            }

            // Insert Executions
            await database.execute("INSERT INTO executions ("+allColumns.toString()+") VALUES ("+securityQuestionMarks+")", [
                req.session.user.id,
                execution.account,
                formatDate(execution.td),
                formatDate(execution.sd),
                execution.currency,
                execution.type,
                execution.side,
                execution.symbol,
                execution.qty,
                execution.price,
                execution.exec_time,
                execution.comm,
                execution.sec,
                execution.taf,
                execution.nscc,
                execution.nasdaq,
                execution.ecn_remove,
                execution.ecn_add,
                execution.gross_proceeds,
                execution.net_proceeds,
                execution.clr_broker,
                execution.liq,
                execution.note,
                trade_qty,
                trade_id,
                rolling_gross_proceeds
            ])

            totalImported++

            // Test
            console.log("insert execution", trade_id, execution.symbol, formatDateTime(execution.td+' '+execution.exec_time), execution.exec_time, execution.side, execution.qty, "=", trade_qty, execution.gross_proceeds, '=', rolling_gross_proceeds)
            
        }

        res.send({
            message: "Upload Received!",
            data: {
                total_imported: totalImported,
                total_skipped: totalSkipped
            }
        }, 200)
    
    } catch (e) {
        console.error('Failed to upload CSV Error : ', e)
        return res.send({
            message: "Upload failed"
        }, 500)
    }
}


/* Trades
--------------------------------------------
--------------------------------------------*/
app.post('/get-trades', async (req, res) => {
    const symbol = req.body.symbol ? 'AND symbol = ?' : '';
    const sideQuery = req.body.side ? 'AND side = ?' : '';
    const params =  [req.session.user.id, req.body.dateFrom, req.body.dateTo]

    const symbolQuery = req.body.symbol ? 'AND symbol = ?' : '';
    const patternsQuery = req.body.patterns.length ? `AND pattern_id IN ('${req.body.patterns.join("','")}')` : '';

    // Save filter date to profile
    db.query("UPDATE members SET dashboard_date_from = ? WHERE id = ?", [req.body.dateFrom, req.session.user.id],(err, result) => {console.log(err)});

    // IDK
    if (req.body.symbol) {
        params.push(req.body.symbol)
    }
    if (req.body.side) {
        params.push(req.body.side)
    }  

    // Select Trades
    db.query(
        `SELECT *, 
        DATE_FORMAT(date_in,'%m-%d-%Y') AS date_in_nice, 
        DATE_FORMAT(date_out,'%m-%d-%Y') AS date_out_nice, 
        DATE_FORMAT(time_in,'%l:%i:%s') AS time_in_nice, 
        DATE_FORMAT(time_out,'%l:%i:%s') AS time_out_nice  
        FROM trades 
        WHERE member_id = ? 
        AND date_out >= ? 
        AND date_out <= ? 
        ${symbolQuery}
        ${patternsQuery}
        ${sideQuery}
        ORDER BY time_out ASC`, 
        params, 
        (err, trades) => {

            if(err) console.log(err);

        /* Trades: By Ticker & Day 
        -----------------------------------------*/
        trades = trades.map(trade => {
            trade.symbolDayPair = trade.symbol+'_'+trade.date_out_nice;
            return trade;
        })
        let tradesByDaySymbol = _.groupBy(trades, trade => trade.symbolDayPair);
        let runningProfit = 0;
        tradesByDaySymbol = _.map(tradesByDaySymbol, (trades,i) => {
            let profitLossDay = _.sumBy(trades, trade => trade.profit_loss);
            runningProfit += profitLossDay
            return { 
                id: i,
                date: trades[0].date_out_nice,
                date_in: trades[0].date_in_nice,
                date_out: trades[0].date_out_nice,
                symbol: trades[0].symbol,
                profit_loss: _.sumBy(trades, trade => trade.profit_loss),
                running_profit: runningProfit,
                trades: trades,
                pattern_id: trades[0].pattern_id,
                showDetails: false
            }
        })

        /* Trades: By Day
        -----------------------------------------*/
        let runningProfitByDay = 0;
        let tradesByDay = _.groupBy(trades, trade => trade.date_out_nice);
        tradesByDay = _.map(tradesByDay, (trades, i) => {
            let profitLossDay = _.sumBy(trades, trade => trade.profit_loss);
            runningProfitByDay += profitLossDay
            return { 
                id: i,
                date: trades[0].date_out_nice,
                symbol: trades[0].symbol,
                profit_loss: profitLossDay,
                running_profit: runningProfitByDay,
                trades: trades
            }
        })

        /* Trade Data Response
        ------------------------------------------*/
        res.send({
            profitAllTime: trades.map(trade => trade.profit_loss).reduce((a, b) => a + b, 0).toFixed(2),
            trades: trades,
            tradesByDaySymbol: tradesByDaySymbol,
            tradesByDay: tradesByDay
        })
    })
}) 


/* Dashboard Old
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







/* Get Trades
--------------------------------------------
--------------------------------------------
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
                    trade_id: e[0].trade_id,
                    symbol : e[0].symbol,
                    exec_time: e[0].exec_time,
                    price: e[0].price, ///////////////////////////// PRICE IS Wrong. should be avg. not index 0.
                    qty: totalQty,
                    side: e[0].side,
                    runningQty: runningQty,
                    trade_qty: e[0].trade_qty,
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
    db.query("DELETE FROM trades WHERE member_id = ?",
        req.session.user.id,
        (err, result) => { 
            if(err) {res.send({ err: err })}
            db.query("DELETE FROM executions WHERE member_id = ?",
            req.session.user.id,
            (err, result) => { 
                if(err) {res.send({ err: err })}
                console.log(result);

                res.send({
                    message: "Trades Deleted!"
                })
            })
        } 
    );
});

    

/*  Chart Data FinnHUB 
--------------------------------------------
--------------------------------------------
//Axios.get("http://localhost:3000/chart_btbt_finnhub_1min.json")
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


/* Polygon Data
--------------------------------------------
--------------------------------------------
--------------------------------------------*/
app.post("/max-reward", (req, res) => {
    console.log(req.body);
    let url = `https://api.polygon.io/v2/aggs/ticker/${req.body.symbol}/range/1/day/${req.body.date_in}/${req.body.date_out}?adjusted=true&sort=asc&limit=120&apiKey=MgtVLp56ofjl7rYmTzaXyIOkwKklqWr2`;
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


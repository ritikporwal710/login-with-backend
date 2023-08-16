import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
const app = express();



// connect to mongodb through mongoose
mongoose.connect("mongodb://127.0.0.1:27017/backend").then(()=>{
    console.log("connected to mongodb successfully");
}).catch((err)=>{
    console.log(err);   
})
// console.log(path.join(path.resolve(),"/public"))



//using middlewares 
app.use(express.static(path.join(path.resolve(),"public"))); // using this we can access to public folder for any file
app.use(express.urlencoded({extended: true}));     //using this middleware we can access the data from login form 
app.use(cookieParser());   // cookieparser is a middleware to use it we need to use app.use now we can access cookies

//setting up view engine
app.set("view engine", "ejs");


// creating schema and model(collection) to store user details in database
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const User = new mongoose.model("User",userSchema);

// first page when go to the port number 5000
app.get("/",async(req,res)=>{
    // console.log(req.cookies);
    const token = req.cookies.token;

    if(token){
        const decoded = jwt.verify(token,"dfdsfsdhsduiwi");
        req.user = await User.findById(decoded._id);

        console.log(req.user);
        res.render("logout",{name:req.user.name});
    }
    else{
        res.redirect("/login");
        // res.render("login");  
    }
}); 

app.get("/login",(req,res)=>{
    res.render("login");
});

// if user not register then go to this register and render register
app.get("/register",(req,res)=>{
    res.render("register");
});
 
app.post("/login",async (req,res)=>{
    let email = req.body.email;
    let password = req.body.password;

    let user = await User.findOne({email});

    if(!user)
    {
        return res.redirect("/register");
    }

    const isMatch = user.password === password;

    if(!isMatch)
    {
        return res.render("login",{email,message: "Incorrect Password"});
    }

    const token = jwt.sign({_id: user._id},"dfdsfsdhsduiwi");

    res.cookie("token",token,{
        httpOnly:true,
        expires: new Date(Date.now() + 60*1000)
    });
    // res.send("now u are login");
    res.redirect("/");
})

// for creating cookies when user click on login and getting the details of user
app.post("/register",async (req,res)=>{
    console.log(req.body);
    let email = req.body.email;
    let user = await User.findOne({email});
    console.log(user);
    if(user)
    {
         return res.redirect("/login");
    } 
    
    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    const token = jwt.sign({_id: user._id},"dfdsfsdhsduiwi");

    res.cookie("token",token,{
        httpOnly:true,
        expires: new Date(Date.now() + 60*1000)
    });
    // res.send("now u are login");
    res.redirect("/");

});


// for removing cookies when user click on logout
app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
        httpOnly:true,
        expires: new Date(Date.now())
    })
    res.redirect("/");

})




// app.post("/contact",async (req,res) =>{
//     console.log(req.body);

//     // the below way is to push the user login data into database 
//         await User.create({
//             name: req.body.name, 
//             email: req.body.email
//         });
     
//     res.render("success");

// })

// app.get("/users", (req,res)=>{
//      res.json({
//         users
//      });
// });
app.listen(5000, () =>{
    console.log("Server is working");

}); 





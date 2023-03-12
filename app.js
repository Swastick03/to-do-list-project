const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
var items = ["Make your Daily Schedule"];                                           //  here we take an array so that we can store the list added to it 
var workitems =[];

mongoose.connect("mongodb+srv://admin-swastick:test-123@cluster0.vxnwnwr.mongodb.net/todolistDB", {useNewUrlParser:true});
const itemsSchema = new mongoose.Schema({
    name:String
});

const Itemdata = mongoose.model("Itemdata", itemsSchema);

const data1 = new Itemdata({
    name: "Make your Daily Schedule"
});
const data2 = new Itemdata({
    name:"Be Consistance"
});

const initialdata = [data1,data2];

const titleSchema = new mongoose.Schema({
    name:String,
    items:[itemsSchema]
});

const titledata = mongoose.model("titledata",titleSchema);



app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

app.get("/", function(req, res){
   
    
    Itemdata.find({})
    .then(function(data){
        if (data.length === 0) {
            Itemdata.insertMany([data1,data2])
            .then(function(){
                console.log("Data Saved successfully");
            }).catch(function(err){
                console.log(err);
            });

            res.redirect("/");
        } else {
            
            res.render("lists", {listTitle:"Today",newlistitem:data});  // we passed the items here because the in render all the lists passed at once
        }
       
    }).catch(function(err){
        console.log(err);
    });

     
});


app.get("/:customTitle", function(req,res){
    const customTitleName = _.capitalize(req.params.customTitle);

    titledata.findOne({name: customTitleName})
    .then(function(data){
        if (!data) {
            const titledata1 = new titledata({
                name:customTitleName,
                items:initialdata
            });
            titledata1.save();

             res.redirect("/"+customTitleName);
        } else {
            
            res.render("lists", {listTitle:data.name,newlistitem:data.items});  // we passed the items here because the in render all the lists passed at once
        }
       
    }).catch(function(err){
        console.log(err);
    });

    

});


app.post("/",function(req,res){
    let item = req.body.newitem;            //we store  the list item in var item, then push it into the items lists to store
    const listname = req.body.list;

    const itemName = new Itemdata({
        name:item
    });

if (listname === "Today") {
    itemName.save();
    res.redirect("/");
} else {
    titledata.findOne({name: listname})
    .then(function(foundlist){
        foundlist.items.push(itemName);
        foundlist.save();
        res.redirect("/"+listname);
    }).catch(function(err){
        console.log(err);
    });
    
}

    
   
                          //we can once render the list, so to send the item from post request we redirect it again
});

app.post("/lists/delete",function(req,res){
    const checkeditem = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Itemdata.findByIdAndRemove(checkeditem)
        .then(function(){
            res.redirect("/");
        }).catch(function(err){
            console.log(err);
        });
    } else {
        titledata.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkeditem}}})
        .then(function(){
            res.redirect("/"+listName);
        }).catch(function(err){
            console.log(err);
        });
    }

    
    
    
});

app.get("/work",function(req,res){
    res.render("lists", {listTitle:"Work Lists", newlistitem:workitems});
});

app.get("/about",function(req,res){
    res.render("about");
});
    
app.listen(3000,function(){
    console.log("Server running on port 3000");
});
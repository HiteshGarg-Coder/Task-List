var http = require("http");
var fs = require("fs");



function readFile( file_name, content_type, response  )
{
  fs.readFile(file_name, function( err, data )
  {
    if(err)
    {
      console.log("error");
    }
    else
    {
      response.writeHead(200, { 'Content-type': content_type});
      response.write(data);
      response.end();
    }
  })
}


function readJSONBody(request, callback) 
{
  var body = '';
  request.on('data', function(chunk) {
					 body += chunk;
			});

  request.on('end', function() {
					var data = JSON.parse(body);
					callback(data);
		   });
}


function writeTask(task , callback)
{
  fs.writeFile("./task_db.txt", task ,function(err)
  {
    if(err)
    {
      throw err;
    }

    callback();
  })
}


function receptionist( request, response )
{
  console.log(request.url, request.method);

  var path = request.url;

  var method = request.method;

  if( method === "GET")
  {
    if( path === "/" )
    {
      readFile("./index.html", 'text/html', response)
    }
    else if( path === "/js/script.js" || path === "/js/handlebars.js" )
    {
      readFile("."+path, 'text/javascript', response)
    }
    else if( path === "/css/style.css" || path === "/css/normalize.css" )
    {
      readFile("."+path, 'text/css', response)
      
    }
    else
    {
      response.writeHead( 200 );
      response.end();
    }
  }
  else if(method === "POST")
  {
    if( path === "/tasks" )
    {
      
      readJSONBody(request, function( task )
      {

        readTasks(function(all_tasks)
        {
          
          if(all_tasks.length === 0)
          {
            all_tasks = [];
          }
          else
          {
            all_tasks = JSON.parse(all_tasks);
          }

          all_tasks.push(task);

          writeTask( JSON.stringify( all_tasks ) , function()
          {
            response.end();
          });
        })
        
      });

    }
  }

}


function readTasks(callback)
{
  fs.readFile("./task_db.txt", function(err, data)
  {
    if(err)
    {
      throw err
    }
    
    callback(data)

  })
}


var server_setup = http.createServer( receptionist );

server_setup.listen( 8000 );

console.log("server is running");
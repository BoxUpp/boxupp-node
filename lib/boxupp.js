#!/usr/bin/env node
var program = require('commander');
var exec = require('child_process').exec;

program
  .version('0.0.1')
  .option('-a, --add', 'Add')		//flags
  .option('-m, --mul', 'multiply');
  
program
  .command('hi')
  .description('say hi')
  .action(function(){
        console.log('Hi my Friend!!!');
});

program
  .command('bye [name]')
  .description('say bye')
  .action(function(name){
        console.log('Bye ' + name + '. It was good to see you!');
});


program
  .command('calculate [val1] [val2]')
  .description('calculator')
  .action(function(v1,v2){
	  var val1=parseInt(v1);
	  var val2=parseInt(v2);

	if(program.add)
	{
		var answer= val1 + val2;
        console.log('Sum of ' + val1+" and "+ val2 + ' is '+answer);
	}
	else if(program.mul)
	{
		var answer=val1*val2;
        console.log('Multiplication of ' + val1 +" and " +val2 + ' is '+answer);
	}
	else
	{
        console.log('provide valid input with valid flag');
	}
});

program
  .command('ls')
  .description('list directories')
  .action(function(env){
   exec('dir', function (error, stdout, stderr) {
   console.log(stdout);			//output in stdout
});
});

program
  .command('*')
  .action(function(env){
    console.log(env+' is not recognised as boxupp command. Enter a Valid command');
});

program.parse(process.argv);
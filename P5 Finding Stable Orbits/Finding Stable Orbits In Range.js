let numElectrons = 50;  // number of electrons
let electrons = [];       // array to store electron objects
const vlim=30;
let winnerVel;
let winnerPos;
let generation=0;
let _frameCount=0;
let maxFrameCount=200;
let boundSize=400;
const positionRandom=4000;
const velocityRandom=20;
const generationDepth=1400;
let winners = [];
let showElectrons=true;
let showButton;


function showPopulation()
{
  if(showElectrons==false)showElectrons=true;
  else showElectrons=false;
}
function setup() {
  createCanvas(800, 800);
  showElectrons=true;
  showButton=createButton('Show Population');
  showButton.position(0,100);
  showButton.mousePressed(showPopulation);
  // create electrons and add them to the array
  for (let i = 0; i < numElectrons; i++) {
    winnerVel=createVector(random(-1,1),random(-1,1));
    winnerPos=createVector(random(width/4,width/2+width/4),random(height/4,height/2+height/4));
    let e = new Electron(winnerPos.x,winnerPos.y,winnerVel.x,winnerVel.y,0);
    electrons.push(e);
  }
}

function generate()
{
  //console.log("generation "+(generation+1));
  generation++;
  let expLife=maxFrameCount;
  let distExp=electrons[0].dist;
  let velExp=electrons[0].vel.x+electrons[0].vel.y;
  let index=0
  for(let i=0;i<numElectrons;i++)
    {
      //find winner
      //winner if who has the longest life expectancy
      //1. was farthest from the nucleus
      //2. had the highest speed
      if(electrons[i].life>=expLife)
      {
        if(electrons[i].dist>distExp)
          if(electrons[i].vel.x+electrons[i].vel.y>velExp)
            {
              expLife=electrons[i].life;
              index=i;
            }
      }
    }
  winnerVel=electrons[index].ivel;
  winnerPos=electrons[index].ipos;
  
  if(electrons[index].dead==0)maxFrameCount+=100;
  else maxFrameCount-=50;
  if(maxFrameCount<100)maxFrameCount=100;
  
  //destroy previous sample
  electrons.splice(0,numElectrons);
  //generate new sample
  let randomness=1/(maxFrameCount**2/(maxFrameCount/2));
  for (let i = 0; i < numElectrons; i++) {
    
    let tempPos=createVector(random(-positionRandom,positionRandom)*randomness, random(-positionRandom,positionRandom)*randomness);
    let tempVel=createVector(random(-velocityRandom,velocityRandom)*randomness, random(-velocityRandom,velocityRandom)*randomness);
    winnerPos.add(tempPos);
    winnerVel.add(tempVel);
    
    let e = new Electron(winnerPos.x,winnerPos.y,winnerVel.x,winnerVel.y,0);
    electrons.push(e);
  }
}

function draw() {
  
  if(_frameCount==maxFrameCount)//reproduce new
  {
    generate();
    _frameCount=0;
  }
  if(maxFrameCount>generationDepth)//found a stable orbital
  {
    _frameCount=0;
    maxFrameCount=100;
    winners.push(new Electron(winnerPos.x,winnerPos.y,winnerVel.x,winnerVel.y,1));
    electrons.splice(0,electrons.length);
    // create electrons and add them to the array
    for (let i = 0; i < numElectrons; i++) {
      winnerVel=createVector(random(-1,1),random(-1,1));
      winnerPos=createVector(random(width/4,width/2+width/4),random(height/4,height/2+height/4));
      let e = new Electron(winnerPos.x,winnerPos.y,winnerVel.x,winnerVel.y,0);
      electrons.push(e);
    }
  }
  
  background(102,110,141);
  // draw bounds
  fill(200,200,200)
  ellipse(width / 2, height / 2, boundSize*2);
  // draw nucleus
  fill(0);
  ellipse(width / 2, height / 2, 4);
  
  
  // draw electrons
  for (let i = 0; i < numElectrons; i++) {
    let e = electrons[i];
    if(e.dead==0)
      {
        e.update();
        if(showElectrons)
          e.display();
      }
    //kill if out of bounds
    if(e.dist<10 || e.dist>400){e.dead=1;}
  }
  //draw winners
  for (let i=0;i<winners.length;i++)
    {
      if(winners[i].dist<10 || winners[i].dist>boundSize){
        winners.splice(i,1);
        continue;
      }
      winners[i].update();
      winners[i].display();
      
    }
  
  let s="generation "+generation+"\nframeCount "+_frameCount+"<"+maxFrameCount+"\nwinners="+winners.length;
  fill(50);
  text(s, 10, 10,40,80);
  _frameCount++;
}

// Electron class
class Electron {
  //let positions=[];
  constructor(wpx,wpy,wvx,wvy,w) {
    // set random initial position and velocity
    this.pos = createVector(wpx,wpy);
    this.vel = createVector(wvx,wvy);
    
    //learning variables
    this.ivel=createVector(wvx,wvy);
    this.ipos=createVector(wpx,wpy);
    this.life=0;
    this.dead=0;
    this.dist=dist(this.pos.x, this.pos.y, width / 2, height / 2);
    this.winner=w;
    
    //trail
    this.poss = [10];
    this.posC=5;
    for(let i=0;i<this.posC;i++)
      {
        this.poss.push(createVector(this.pos.x,this.pos.x));
      }
    
  }

  update() {
    //inc life
    this.life++;
    
    //position velocity calculation
    let d = dist(this.pos.x, this.pos.y, width / 2, height / 2);
    this.dist=d;
    let force = -500 / (d * d);
    let angle = atan2(this.pos.y - height / 2, this.pos.x - width / 2);
    this.vel.x += force * cos(angle);
    this.vel.y += force * sin(angle);
    
    //speed limit
    if(this.vel.x>vlim)this.vel.x=vlim;if(this.vel.x<-vlim)this.vel.x=-vlim;
    if(this.vel.y>vlim)this.vel.y=vlim;if(this.vel.y<-vlim)this.vel.y=-vlim;

    // update position based on velocity
    this.pos.add(this.vel);
    
    //add to trail
    this.poss.push(createVector(this.pos.x,this.pos.y));
    //cut off oldest trail element
    if(this.poss.length>this.posC)
      {
        this.poss.splice(0,1);
      }
    
  }

  display() {
    
    
    if(this.winner==0){
      //electron
      fill(50)
      ellipse(this.pos.x, this.pos.y, 5);
    }
    else{
      //electron
      fill(222,200,22)
      ellipse(this.pos.x, this.pos.y, 20);
      fill(222,100,50)
      ellipse(this.ipos.x,this.ipos.y,5);
      let winnerVals=floor(this.ipos.x)+","+floor(this.ipos.y)+" "+floor(this.ivel.x)+","+floor(this.ivel.y);
      fill(50)
      text(winnerVals,this.ipos.x+2,this.ipos.y+2);
    } 
    
    //trail
    for(let i=0;i<this.poss.length;i++)
    {
      ellipse(this.poss[i].x,this.poss[i].y,2);
    }
    //details
    //let s = floor(this.pos.x)+","+floor(this.pos.y);//+"("+floor(this.dist)+")";
    //fill(50)
    //text(s, this.pos.x+2, this.pos.y+2,40,80);
  }
  printDesc()
  {
    let s=this.life+" "+this.dead+" "+this.ipos+" "+this.ivel;
    //onsole.log(s);
  }
}

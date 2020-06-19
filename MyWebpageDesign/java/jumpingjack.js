var button = document.getElementById("jumping_jack");
// button id = jumping_jack
button.onclick = function(){
    var text = document.getElementById("jumping_jack").textContent;
// text == Jumping Jack
    if (text == 'Jumping Jack'){
        document.getElementById("jumping_jack").textContent = "Stop Stream";
        let video;
        let poseNet;
        let pose;

        let body_number;

        // let nose_array = [];
        // let nose_confidence = [];
        let compare_number = 5;
        // let position = 90;

        let canvas_width = 640;
        let canvas_height = 480;
        // websocket for servo motor
        // const socket = new WebSocket('ws://10.0.0.14');
        new p5();
        setup();
        

        function setup(){
            let cnv = createCanvas(canvas_width, canvas_height);
            cnv.position(600, 200);
            // open webcam
            video = createCapture(VIDEO);

            video.hide();
            //import ml5.js library
            poseNet = ml5.poseNet(video, modelLoaded);
            poseNet.on('pose', gotPoses);
            body_number = 0;
            // socket.addEventListener('open', function (event) {
            // socket.send(position); //the angle to servo motor
        // });
        }

        function modelLoaded() {
        }

        function gotPoses(poses){
            if (poses.length > 0) {
                pose = poses[0].pose;
                skeleton = poses[0].skeleton;
            }
            // console.log(pose);
            let nose = pose.nose;
            // let leftWrist = pose.leftWrist;
            // let rightWrist = pose.rightWrist;
            // let leftEye = pose.leftEye;
            // let rightEye = pose.rightEye;
            let shoulder = pose.leftShoulder;
            // let rightShoulder = pose.rightShoulder;
            // let leftAnkle = pose.leftAnkle;
            // let rightAnkle = pose.rightAnkle;
            let leftElbow = pose.leftElbow;
            let rightElbow = pose.rightElbow;
            

            let ankle_distance = 20;
            // nose_array[nose_number] = nose.x;
            // nose_confidence[nose_number] = nose.confidence;
            draw();
            // labels
            
            console.log(leftElbow.y)
            console.log(rightElbow.y)
            console.log(shoulder.y)

            if (body_number > compare_number){

                
                if(leftElbow.confidence > 0.6 && rightElbow.confidence > 0.6 && shoulder.confidence > 0.6){
                    if(leftElbow.y < shoulder.y && rightElbow.y < shoulder.y){
                        label = 'open';
                        console.log(label);
                        document.getElementById("openclose").textContent = "open";
                        body_number = 0;
                        
                    }
                    if(leftElbow.y > shoulder.y && rightElbow.y > shoulder.y){
                        label = 'close';
                        console.log(label);
                        document.getElementById("openclose").textContent = "close";
                        body_number = 0
                    }
                }
            }


            // if (body_number > compare_number){

            //     if(leftElbow.confidence > 0.6 && rightElbow.confidence > 0.6 && shoulder.confidence > 0.6){
            //         if(leftElbow.y > shoulder.y && rightElbow.y > shoulder.y){
            //             label = 'close';
            //             console.log(label);
            //             document.getElementById("openclose").textContent = "open";
            //             body_number = 0
            //         }
            //     }
            // }


                

                    
            // if (body_number <= compare_number){
            //             label = "jumping jack";
            //             console.log(label);
            //  }
            body_number = body_number + 1;
            console.log(body_number);

        }


        function draw(label) {
            image(video, 0, 0);
            // console.log(3333);
            if (pose) {
                for (let i = 0; i < skeleton.length; i++) {
                  let a = skeleton[i][0];
                  let b = skeleton[i][1];
                  strokeWeight(2);
                  stroke(0);
            
                  line(a.position.x, a.position.y, b.position.x, b.position.y);
                }
                for (let i = 0; i < pose.keypoints.length; i++) {
                  let x = pose.keypoints[i].position.x;
                  let y = pose.keypoints[i].position.y;
                  fill(0);
                  stroke(255);
                  ellipse(x, y, 4, 4);
                }
              }
            // pop();

            // fill(255, 0, 255);
            // noStroke();
            // textSize(25);
            // textAlign(CENTER, CENTER);
            // // text(label, width / 5, height / 5);
        }

    // }else{
    //     document.getElementById("jumping_jack").textContent = "Jumping Jack";

    //     let video;
    //     new p5();
    //     setup();

    //     function setup(){
    //         let cnv = createCanvas(640, 480);
    //         cnv.position(600, 200);
    //         video = createCapture(VIDEO);
    //         video.stop();
    //         draw();
    //         delete video;

            
    //     }
    //     console.log('stop');

    //     function draw(){

    //     }
    }
}
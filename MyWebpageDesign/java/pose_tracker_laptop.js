var button = document.getElementById("Laptop_webcam");
button.onclick = function(){
    var text = document.getElementById("Laptop_webcam").textContent;

    if (text == 'Laptop Webcam'){
        document.getElementById("Laptop_webcam").textContent = "Stop Stream";
        let video;
        let poseNet;
        let pose;
        let nose_number;
        let nose_array = [];
        let nose_confidence = [];
        let compare_number = 5;
        let position = 90;

        let canvas_width = 640;
        let canvas_height = 480;
        // websocket for servo motor

        const socket = new WebSocket('ws://10.0.0.14');
        
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
            nose_number = 0;
            socket.addEventListener('open', function (event) {
            socket.send(position); //the angle to servo motor
        });
        }

        function modelLoaded() {
        }

        function gotPoses(poses){
            // console.log(poses);
            if (poses.length > 0) {
                pose = poses[0].pose;
                skeleton = poses[0].skeleton;
            }

            let nose = pose.nose;
            nose_array[nose_number] = nose.x;
            nose_confidence[nose_number] = nose.confidence;
            draw();
            let tt = nose_number%compare_number;
            if (tt == 0){
                if(nose_confidence[nose_number] > 0.9){
                    if(nose_array[nose_number]> 360 || nose_array[nose_number]<280){
                        position = position + parseInt(-0.08*(nose_array[nose_number] - canvas_width/2));
                        if (position > 0 && position <180){
                            socket.send(position);
                            console.log(position);
                        }
                    }
                }
            }

            nose_number = nose_number + 1;

        }


        function draw() {
            image(video, 0, 0);
            // console.log(3333);
            if (pose) {
            for (let i = 0; i < skeleton.length; i++) {
                let a = skeleton[i][0];
                let b = skeleton[i][1];
                strokeWeight(10);
                stroke(255);
                line(a.position.x, a.position.y,b.position.x,b.position.y);      
            }
            }
        }
    }else{
        document.getElementById("Laptop_webcam").textContent = "Laptop Webcam";

        let video;
        new p5();
        setup();

        function setup(){
            let cnv = createCanvas(640, 480);
            cnv.position(600, 200);
            video = createCapture(VIDEO);
            video.stop();
            draw();
            delete video;

            
        }
        // console.log('stop');

        function draw(){
            // console.log("5555");

        }
    }
}
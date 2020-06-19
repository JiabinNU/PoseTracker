var button = document.getElementById("ESP32CAM");
button.onclick = function(){
    var text = document.getElementById("ESP32CAM").textContent;
    if (text == 'ESP32 CAM'){
        document.getElementById("ESP32CAM").textContent = "Stop Stream";

        let nose;
        let nose_number;
        let nose_array = [];
        let nose_confidence = [];
        let compare_number = 5;
        let position = 90;
        let canvas_width = 640;
        let canvas_height = 480;
        const socket_servo = new WebSocket('ws://10.0.0.14');
        const socket_CAM = new WebSocket('ws://10.0.0.16');
        main();
     
        function main(){
            // Connection opened
            socket_CAM.addEventListener('open', function (event) {
                socket_CAM.send('Hello Server!');
            });

            // Listen for messages
            socket_CAM.addEventListener('message', function (event) {
                console.log('Message from server ', event.data);
                document.getElementById('test').src = URL.createObjectURL(event.data); //display the image
                var img = document.createElement("img");
                img.src = window.URL.createObjectURL(event.data);
                // document.body.appendChild(img);
                var flipHorizontal = false;
                posenet.load().then(function(net) {
                    const pose = net.estimateSinglePose(img, {flipHorizontal: true});
                    return pose;}).then(function(pose){
                        // console.log(pose.keypoints[0].score);
                        // console.log(pose.keypoints[0].position.x);
                        // console.log(pose.keypoints[0].position.y);
                        nose_number = 0;
                        socket_servo.addEventListener('open', function (event) {
                            socket_servo.send(position); //the angle to servo motor
                        });
                        nose = pose.keypoints[0];
                        nose_array[nose_number] = nose.position.x;
                        nose_confidence[nose_number] = nose.score;
                        let tt = nose_number%compare_number;
                        if (tt == 0){
                            if(nose_confidence[nose_number] > 0.9){
                                if(nose_array[nose_number]> 360 || nose_array[nose_number]<280){
                                    position = position + parseInt(-0.08*(nose_array[nose_number] - canvas_width/2));
                                    if (position > 0 && position <180){
                                        socket_servo.send(position);
                                        console.log(position);
                                    }
                                }
                            }
                        }
                        nose_number = nose_number + 1;

                    })


            });



        }





    }else{
        document.getElementById("ESP32CAM").textContent = "ESP32 CAM";
    }
}
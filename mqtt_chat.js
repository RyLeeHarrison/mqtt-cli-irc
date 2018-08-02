const mqtt = require('mqtt');
const readline = require('readline');

const broker = 'mqtt://test.mosquitto.org';
const topic = 'chatroom_channel';

const client = mqtt.connect(broker, {
    clientId: `${Math.floor(Math.random() * 1000) + 1}_user`
});

client.on('connect', () =>  {
    let _nickname = client.options.clientId;

    client.subscribe(topic, err => {
        if (err) client.end();

        sendMessage(`${_nickname} joined the channel`, "join")

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: ` ~ `
        });

        rl.prompt();
        
        rl.on("line", (line) => {
            sendMessage(line)
            rl.prompt();
        });
        
        rl.on('close', () => {
            sendMessage(`${_nickname} has left the channel`)
            process.exit(0);
        });

        function sendMessage(value, type) {
            if (!(value.length === 0 || !value.trim())) {
                client.publish(topic, JSON.stringify({
                    nickname: _nickname,
                    type: type,
                    value: value
                }))
            }
        }

        client.on('message', (topic, message) => {
            const json = JSON.parse(message.toString())

            if (_nickname === json.nickname) {
                if (json.type === "join") {
                    console.log(json.value)
                }
                rl.prompt();
            } else {
                console.log(`[${topic}/${json.nickname}]: ${json.value}`);
            }
        });
    })
});


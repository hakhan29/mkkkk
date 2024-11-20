const video = document.getElementById('video');
const expressionDiv = document.getElementById('expression');

// 모델 파일 로드
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(startVideo);

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => video.srcObject = stream)
        .catch(err => console.error(err));
}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

        if (detections.length > 0) {
            const expressions = detections[0].expressions;

            // 각 감정 값이 없을 경우 기본값 0 할당
            const anger = expressions.anger || 0;
            const happy = expressions.happy || 0;
            const sad = expressions.sad || 0;
            const neutral = expressions.neutral || 0;

            console.log('Expressions:', { anger, happy, sad, neutral }); // 감정 데이터 확인

            // 색상 계산 (안전한 연산)
            const red = Math.round(anger * 255 + happy * 255);
            const green = Math.round(happy * 255 + neutral * 255 + (1 - anger - sad - happy - neutral) * 128);
            const blue = Math.round(sad * 255 + neutral * 255);

            console.log(`Colors - R: ${red}, G: ${green}, B: ${blue}`); // 색상 값 출력

            // 색상 적용
            const textColor = `rgb(${red}, ${green}, ${blue})`;
            expressionDiv.style.color = textColor;

            // 가장 높은 확률의 표정 이름 표시
            const highestExpression = Object.keys(expressions).reduce((a, b) =>
                expressions[a] > expressions[b] ? a : b
            );
            expressionDiv.textContent = `Detected Expression: ${highestExpression}`;
        } else {
            expressionDiv.textContent = 'No face detected';
            expressionDiv.style.color = 'white';
        }
    }, 100);
});


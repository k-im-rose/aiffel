# 테스트에 쓴 프롬프트 모음

`pose_tool.ipynb` 가 실제로 생성한 기록입니다. 모델: FLUX.2-klein 4B (GGUF Q4_K_M), ComfyUI, 4스텝, cfg 4.0, euler/simple.

포즈 조건을 켠 생성에는 프롬프트 뒤에 아래 지시문이 자동으로 붙습니다.

```
The person must take exactly the same body pose as the stick-figure skeleton in the reference image: same head direction, same arm and hand positions, same leg positions, same body angle. Do not draw the skeleton itself: no colored lines, no dots, no black background.
```

기본 네거티브: `stick figure, skeleton, colored lines, keypoints, dots, black background, extra limbs, deformed hands`

| 결과 파일 | 포즈 | 포즈 조건 | 프롬프트 | 시드 | 크기 | 걸린 시간 |
|---|---|---|---|---|---|---|
| output_01.png | pose_01.png | 켬 | A firefighter in a yellow uniform standing in a city street, photorealistic, natural daylight | 42 | 688x1024 | 95.6초 |
| output_01_nopose.png | pose_01.png | 끔 | A firefighter in a yellow uniform standing in a city street, photorealistic, natural daylight | 42 | 688x1024 | 19.1초 |
| output_02.png | pose_02.png | 켬 | A firefighter in a yellow uniform standing in a city street, photorealistic, natural daylight | 42 | 688x1024 | 39.2초 |
| output_02_nopose.png | pose_02.png | 끔 | A firefighter in a yellow uniform standing in a city street, photorealistic, natural daylight | 42 | 688x1024 | 20.1초 |
| output_03.png | pose_03.png | 켬 | A firefighter in a yellow uniform standing in a city street, photorealistic, natural daylight | 42 | 688x1024 | 39.2초 |
| output_03_nopose.png | pose_03.png | 끔 | A firefighter in a yellow uniform standing in a city street, photorealistic, natural daylight | 42 | 688x1024 | 19.3초 |
| expA_01.png | pose_01.png | 켬 | An astronaut in a white spacesuit on the surface of the moon, photorealistic | 42 | 688x1024 | 39.2초 |
| expA_02.png | pose_01.png | 켬 | A chef in a white uniform in a busy restaurant kitchen, warm lighting, photorealistic | 42 | 688x1024 | 37.2초 |
| expA_03.png | pose_01.png | 켬 | A watercolor illustration of a young girl in a red dress in a flower garden | 42 | 688x1024 | 37.2초 |
| expB_01.png | pose_01.png | 켬 | A businessman in a navy suit in a modern office, photorealistic, soft window light | 42 | 688x1024 | 37.2초 |
| expB_02.png | pose_02.png | 켬 | A businessman in a navy suit in a modern office, photorealistic, soft window light | 42 | 688x1024 | 36.2초 |
| expB_03.png | pose_03.png | 켬 | A businessman in a navy suit in a modern office, photorealistic, soft window light | 42 | 688x1024 | 36.2초 |

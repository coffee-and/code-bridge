export const BLOCK_DEFINITIONS = [
  {
    type: "move",
    title: "이동",
    description: "도형을 원하는 방향으로 이동합니다.",
    className: "block-card--motion",
  },
  {
    type: "rotate",
    title: "회전",
    description: "도형을 지정한 각도만큼 회전합니다.",
    className: "block-card--rotate",
  },
  {
    type: "changeColor",
    title: "색상 변경",
    description: "도형의 색상을 변경합니다.",
    className: "block-card--color",
  },
  {
    type: "repeat",
    title: "반복",
    description: "바로 위 명령을 지정한 횟수만큼 반복합니다.",
    className: "block-card--repeat",
  },
] as const;

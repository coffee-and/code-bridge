import { executeProgram, executeProgramBlock } from "../../engine/interpreter";
import { useExecutionStore } from "../../stores/executionStore";
import { useProgramStore } from "../../stores/programStore";
import { useShapeStore } from "../../stores/shapeStore";

export const ExecutionControls = () => {
  const blocks = useProgramStore((state) => state.blocks);

  const shapes = useShapeStore((state) => state.shapes);
  const replaceShapes = useShapeStore((state) => state.replaceShapes);

  const currentStep = useExecutionStore((state) => state.currentStep);
  const initialShapes = useExecutionStore((state) => state.initialShapes);
  const setCurrentStep = useExecutionStore((state) => state.setCurrentStep);
  const setActiveBlockIndex = useExecutionStore(
    (state) => state.setActiveBlockIndex,
  );
  const captureInitialShapes = useExecutionStore(
    (state) => state.captureInitialShapes,
  );
  const clearExecution = useExecutionStore((state) => state.clearExecution);

  const prepareInitialShapes = () => {
    if (!initialShapes) {
      captureInitialShapes(shapes);

      return shapes.map((shape) => ({
        ...shape,
      }));
    }

    return initialShapes;
  };

  const handleRun = () => {
    if (blocks.length === 0) {
      window.alert("실행할 블록을 먼저 추가해 주세요.");
      return;
    }

    prepareInitialShapes();
    executeProgram(blocks);

    setCurrentStep(blocks.length);
    setActiveBlockIndex(blocks.length - 1);
  };

  const handleStep = () => {
    if (blocks.length === 0) {
      window.alert("실행할 블록을 먼저 추가해 주세요.");
      return;
    }

    if (currentStep >= blocks.length) {
      window.alert("모든 블록을 실행했습니다.");
      return;
    }

    prepareInitialShapes();

    executeProgramBlock(blocks[currentStep], blocks[currentStep - 1]);

    setActiveBlockIndex(currentStep);
    setCurrentStep(currentStep + 1);
  };

  const handleReset = () => {
    if (initialShapes) {
      replaceShapes(initialShapes);
    }

    clearExecution();
  };

  return (
    <div className="execution-controls">
      <button
        className="button button--primary"
        type="button"
        onClick={handleRun}
      >
        실행
      </button>
      <button className="button" type="button" onClick={handleStep}>
        한 단계
      </button>
      <button className="button" type="button" onClick={handleReset}>
        초기화
      </button>
    </div>
  );
};

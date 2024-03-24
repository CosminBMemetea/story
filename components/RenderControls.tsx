
import { z } from "zod";
import { useRendering } from "../helpers/use-rendering";
import { CompositionProps, COMP_NAME } from "../types/constants";
import { AlignEnd } from "./AlignEnd";
import { Button } from "./Button/Button";
import { InputContainer } from "./Container";
import { DownloadButton } from "./DownloadButton";
import { ErrorComp } from "./Error";
import { Input } from "./Input";
import { ProgressBar } from "./ProgressBar";
import { Spacing } from "./Spacing";
import { useState } from "react";
interface ComingSoonDialogProps {
    onClose: () => void;
}

const ComingSoonDialog =  ({ onClose }: ComingSoonDialogProps) => (
    <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px',
        background: 'rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(5px)',
        borderRadius: '10px',
        padding: '20px',
        color: '#fff',
        textAlign: 'center',
        zIndex: 1000,
    }}>
        <h2>Feature Coming Soon!</h2>
        <p>This feature is under development and will be available soon.</p>
        <button onClick={onClose} style={{
            marginTop: '15px',
            padding: '5px 10px',
            background: 'rgba(0, 0, 0, 0.5)',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer'
        }}>
            Close
        </button>
    </div>
);

export const RenderControls: React.FC<{
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  inputProps: z.infer<typeof CompositionProps>;
}> = ({ text,setText, inputProps }) => {
  const { renderMedia, state, undo } = useRendering(COMP_NAME, inputProps);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const toggleComingSoonDialog = () => {
    setShowComingSoon(!showComingSoon);
  };


  return (
    <InputContainer>
      {showComingSoon && <ComingSoonDialog onClose={toggleComingSoonDialog} />}
      {state.status === "init" ||
      state.status === "invoking" ||
      state.status === "error" ? (
        <>
          <Input
            disabled={state.status === "invoking"}
            setText={setText}
            text={text}
          ></Input>
          <Spacing></Spacing>
  
          <Spacing></Spacing>
          <AlignEnd>
          {state.status === "invoking" && ( // TODO To be removed only added cuz it needs refactoring 
                <Button
                    onClick={renderMedia}
                >
                    Share video
                </Button>
            )}
            <Button
              disabled={state.status === "invoking"}
              loading={state.status === "invoking"}
              onClick={toggleComingSoonDialog}
            >
              Share video
            </Button>
          </AlignEnd>
          {state.status === "error" ? (
            <ErrorComp message={state.error.message}></ErrorComp>
          ) : null}
        </>
      ) : null}
      {state.status === "rendering" || state.status === "done" ? (
        <>
          <ProgressBar
            progress={state.status === "rendering" ? state.progress : 1}
          />
          <Spacing></Spacing>
          <AlignEnd>
            <DownloadButton undo={undo} state={state}></DownloadButton>
          </AlignEnd>
        </>
      ) : null}
    </InputContainer>
  );
};
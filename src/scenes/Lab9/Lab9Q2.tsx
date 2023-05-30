import {
  DEFAULT,
  ThreadGenerator,
  all,
  createRef,
  range,
  waitFor,
} from "@motion-canvas/core";
import { makeScene2D } from "@motion-canvas/2d/lib/scenes";
import {
  Circle,
  Layout,
  Line,
  Node,
  Rect,
  Txt,
} from "@motion-canvas/2d/lib/components";
import {
  CodeBlock,
  edit,
  lines,
} from "@motion-canvas/2d/lib/components/CodeBlock";

export default makeScene2D(function* (view) {
  const stackLayoutRef = createRef<Rect>();
  const answerLayoutRef = createRef<Rect>();
  const stackScreenRectRef = createRef<Rect>();
  const inputCodeRef = createRef<CodeBlock>();
  const stack: { rect: Rect; codeBlock: CodeBlock; code: string }[] = [];

  view.add(
    <Layout
      layout
      direction={"column"}
      width={"100%"}
      height={"100%"}
      padding={10}
      gap={20}
    >
      <Layout grow={1} direction={"row"} gap={25} padding={5}>
        <Rect
          layout
          ref={answerLayoutRef}
          stroke={"#fff"}
          lineWidth={10}
          radius={20}
          grow={1}
          maxHeight={540}
          maxWidth={"50%"}
          wrap={"wrap"}
          padding={20}
          gap={35}
          alignItems={"baseline"}
          alignContent={"start"}
          direction={"column"}
        ></Rect>
        <Rect
          layout
          stroke={"#fff"}
          lineWidth={10}
          radius={20}
          grow={1}
          maxHeight={540}
          ref={stackScreenRectRef}
        >
          <Line
            layout={false}
            stroke={"#fff"}
            lineWidth={20}
            lineCap={"round"}
            radius={20}
            position={[0, -150]}
            points={[
              [-250, 0],
              [-250, 300],
              [250, 300],
              [250, 0],
            ]}
          />
          <Rect
            ref={stackLayoutRef}
            layout={false}
            position={[0, -15]}
            size={[450, 280]}
          />
        </Rect>
      </Layout>
      <Rect
        layout
        grow={1}
        stroke={"#fff"}
        lineWidth={10}
        radius={20}
        maxHeight={"50%"}
        padding={[60, 30]}
      >
        <CodeBlock
          ref={inputCodeRef}
          fontSize={36.5}
          code={`
            public static void permuteString(String beginningString, String endingString) {
                if (endingString.length() <= 1)
                    System.out.println(beginningString + endingString);
                else
                    for (int i = 0; i < endingString.length(); i++) {
                        String newString = endingString.substring(0, i) + endingString.substring(i + 1);
                        permuteString(beginningString + endingString.charAt(i), newString);
                }
            }`}
        />
      </Rect>
    </Layout>
  );
  yield* waitFor(1);
  yield* pushToStack(stack, `f("", "ABCD") i: 1`);
  yield* permuteString("", "ABCD");

  function* pushToStack(
    stack: { rect: Rect; codeBlock: CodeBlock; code: string }[],
    code: string
  ): ThreadGenerator {
    const newRectRef = createRef<Rect>();
    const newCodeBlockRef = createRef<CodeBlock>();
    stackScreenRectRef().add(
      <Rect
        ref={newRectRef}
        layout={false}
        stroke={"#1a1a1a"}
        lineWidth={8}
        fill={"#fff"}
        position={[0, -200]}
        size={[450, 60]}
      >
        <CodeBlock
          ref={newCodeBlockRef}
          position={[0, 8]}
          theme={{
            variable: { text: "black" },
            stringContent: { text: "black" },
            stringPunctuation: { text: "black" },
            entityName: { text: "black" },
            keyword: { text: "black" },
            literal: { text: "black" },
          }}
          fontSize={40}
          code={code}
        />
      </Rect>
    );
    if (stack.length == 0) {
      yield* newRectRef().bottom(stackLayoutRef().bottom, 0.5);
    } else {
      const lastRect = stack[stack.length - 1].rect;
      yield* newRectRef().bottom(lastRect.top, 0.5);
    }
    stack.push({
      rect: newRectRef(),
      codeBlock: newCodeBlockRef(),
      code: code,
    });
  }

  function* popFromStack(
    stack: { rect: Rect; codeBlock: CodeBlock; code: string }[]
  ): ThreadGenerator {
    if (stack.length == 0) {
      return;
    } else {
      const lastRect = stack[stack.length - 1].rect;
      yield* lastRect.scale(0, 0.5);
      lastRect.remove();
      stack.pop();
    }
  }

  function* permuteString(
    beginningString: string,
    endingString: string
  ): ThreadGenerator {
    if (endingString.length <= 1) {
      yield* inputCodeRef().selection(lines(1, 2), 0.5);
      const answerTxtRef = createRef<Txt>();
      answerLayoutRef().add(
        <Txt
          ref={answerTxtRef}
          fill={"#ff7e75"}
          text={beginningString + endingString}
          grow={0}
          opacity={0}
          alignSelf={"start"}
          height={"5%"}
        />
      );
      yield* answerTxtRef().opacity(1, 1);
    } else {
      for (let i = 0; i < endingString.length; i++) {
        yield* inputCodeRef().selection(lines(3, 7), 0.5);
        let newString =
          endingString.substring(0, i) + endingString.substring(i + 1);
        yield* pushToStack(
          stack,
          `f("${
            beginningString + endingString.charAt(i)
          }", "${newString}") i: 1`
        );
        yield* permuteString(
          beginningString + endingString.charAt(i),
          newString
        );
      }
    }
    yield* popFromStack(stack);
    if (stack.length > 0) {
      const topCodeBlock = stack[stack.length - 1].codeBlock;
      const topCodeString = stack[stack.length - 1].code;
      const lastCodeExcludingIndex = topCodeString.substring(
        0,
        topCodeString.length - 1
      );
      const lastIndex = Number(topCodeString.charAt(topCodeString.length - 1));
      stack[stack.length - 1].code = `${lastCodeExcludingIndex}${
        lastIndex + 1
      }`;
      yield* topCodeBlock.edit(1.5)`${lastCodeExcludingIndex}${edit(
        `${lastIndex}`,
        `${lastIndex + 1}`
      )}`;
      yield* all(
        topCodeBlock.selection(DEFAULT, 0.5),
        inputCodeRef().selection(lines(3, 7), 0.5)
      );
    }
  }
});

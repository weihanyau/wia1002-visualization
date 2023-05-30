import { ThreadGenerator, all, createRef, waitFor } from "@motion-canvas/core";
import { makeScene2D } from "@motion-canvas/2d/lib/scenes";
import {
  Circle,
  Layout,
  Line,
  Node,
  Rect,
} from "@motion-canvas/2d/lib/components";
import { CodeBlock } from "@motion-canvas/2d/lib/components/CodeBlock";

export default makeScene2D(function* (view) {
  const stackLayoutRef = createRef<Rect>();
  const stackScreenRectRef = createRef<Rect>();
  const stack: Rect[] = [];

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
          stroke={"#fff"}
          lineWidth={10}
          radius={20}
          grow={1}
          maxHeight={540}
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
              [-150, 0],
              [-150, 300],
              [150, 300],
              [150, 0],
            ]}
          />
          <Rect
            ref={stackLayoutRef}
            layout={false}
            position={[0, -15]}
            size={[250, 280]}
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
  yield* pushToStack(stack);
  yield* pushToStack(stack);
  //   yield* permuteString("", "ABC");

  function* pushToStack(stack: Rect[]): ThreadGenerator {
    const newRectRef = createRef<Rect>();
    stackScreenRectRef().add(
      <Rect
        ref={newRectRef}
        layout={false}
        fill={"#fff"}
        position={[0, -15]}
        size={[250, 50]}
      />
    );
    if (stack.length == 0) {
      yield* newRectRef().bottom(stackLayoutRef().bottom, 1);
    } else {
      const lastRect = stack[stack.length - 1];
      yield* newRectRef().bottom(lastRect.top, 1);
    }
    stack.push(newRectRef());
  }

  function* permuteString(
    beginningString: string,
    endingString: string
  ): ThreadGenerator {
    if (endingString.length <= 1) {
      console.log(beginningString + endingString);
    } else {
      for (let i = 0; i < endingString.length; i++) {
        let newString =
          endingString.substring(0, i) + endingString.substring(i + 1);
        yield* permuteString(
          beginningString + endingString.charAt(i),
          newString
        );
      }
    }
  }
});

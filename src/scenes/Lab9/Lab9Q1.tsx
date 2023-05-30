import { makeScene2D } from "@motion-canvas/2d/lib/scenes";
import { Layout, Rect, Line, Ray } from "@motion-canvas/2d/lib/components";
import {
  CodeBlock,
  edit,
  insert,
  lines,
  remove,
} from "@motion-canvas/2d/lib/components/CodeBlock";
import {
  makeRef,
  range,
  useRandom,
  createRef,
} from "@motion-canvas/core/lib/utils";
import { all, loop, sequence, waitFor } from "@motion-canvas/core/lib/flow";
import { DEFAULT } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const inputString = "flabbergasted";
  const answerRef = createRef<CodeBlock>();
  const codeRef = createRef<CodeBlock>();
  let answer = "";

  view.add(
    <Layout layout direction={"column"} width={1920} height={1080}>
      <Layout
        height={"50%"}
        width="100%"
        justifyContent={"center"}
        alignItems={"center"}
        padding={30}
      >
        <CodeBlock ref={answerRef} fontSize={60} />
      </Layout>
      <Line
        stroke={"#fff"}
        minHeight={"2%"}
        lineWidth={5}
        lineCap={"round"}
        startOffset={100}
        endOffset={100}
        points={[
          [0, 0],
          [1920, 0],
        ]}
      />
      <Layout grow={1} height={"50%"} padding={[30, 150]}>
        <CodeBlock
          ref={codeRef}
          fontSize={40}
          language="java"
          width={"100%"}
          code={`
public static String substituteAI (String str) {
    //Base Case:
    if (str.length() == 0)
        return str;
    //Recursive Case:
    else if (str.charAt(0) == ('a'))
        return 'i' + substituteAI(str.substring(1));
    else
        return str.charAt(0) + substituteAI(str.substring(1));
}`}
        />
      </Layout>
    </Layout>
  );
  yield* answerRef().edit(2)`${insert(`substituteAI("${inputString}")`)}`;
  yield* substituteAI(inputString);
  yield* waitFor(2);

  function* substituteAI(input: string): Generator<unknown, string, unknown> {
    if (input.length == 0) {
      yield* codeRef().selection(lines(1, 3), 1);
      yield* answerRef().edit(1.2)`"${answer}"${edit(
        ` + substituteAI("${input}")`,
        ""
      )}`;
      yield* answerRef().selection(DEFAULT, 0.5);
      return input;
    }

    if (input.startsWith("a")) {
      yield* codeRef().selection(lines(4, 6), 1);
      if (input.length === inputString.length) {
        yield* answerRef().edit(1.2)`${insert(`"i" + `)}substituteAI("${edit(
          input,
          input.substring(1)
        )}")`;
      } else {
        yield* answerRef().edit(1.2)`"${answer}" + ${edit(
          `substituteAI("${input}")`,
          `i + substituteAI("${input.substring(1)}")`
        )}`;
        yield* answerRef().edit(1.2)`"${answer}${insert("i")}"${remove(
          ` + i`
        )} + substituteAI("${input.substring(1)}")`;
      }
      answer += "i";
      return "i" + (yield* substituteAI(input.substring(1)));
    }

    yield* codeRef().selection(lines(7, 8), 1);
    if (input.length === inputString.length) {
      yield* answerRef().edit(1.2)`${insert(
        `"${input.charAt(0)}" + `
      )}substituteAI("${edit(input, input.substring(1))}")`;
    } else {
      yield* answerRef().edit(1.2)`"${answer}" + ${edit(
        `substituteAI("${input}")`,
        `${input.charAt(0)} + substituteAI("${input.substring(1)}")`
      )}`;
      yield* answerRef().edit(1.2)`"${answer}${insert(
        input.charAt(0)
      )}"${remove(` + ${input.charAt(0)}`)} + substituteAI("${input.substring(
        1
      )}")`;
    }
    answer += input.charAt(0);
    return input.charAt(0) + (yield* substituteAI(input.substring(1)));
  }
});

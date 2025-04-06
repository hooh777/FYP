"use server";
import { Ollama } from "ollama";
import {get_best_3} from "./gen_best"


export async function POST(request) {
  const ollama = new Ollama({ host: "http://172.20.16.1:11434/" }); 
  try {
    const { message,user,context=[]} = await request.json();
    

    let context_prompt="Here are the previous responses you may refer to: "+context
   
    let exercises = await get_best_3(BigInt(user));

    let exercises_prompt="Here is a list of the users' favorite exercises: "+exercises+". Use the list when user asks about exercise.";
    
    const constrain= "You are a gym advisor chatbot. Ensure your responce in english. ";
    
    let prompt= (context.length==0)?constrain+exercises_prompt:constrain+exercises_prompt+context_prompt;

    const stream = await ollama.chat({
      model: "deepseek-r1:7b-qwen-distill-q4_K_M",
      messages: [ 
                  { role: "system", content: prompt},
                  
                  { role: "user", content: message }

                ],
      stream: true,
    });
    
    let endThink=false,think="",output="";

    return new Response(
      new ReadableStream({

        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const chunk of stream) {
              // Each chunk is an object with a 'message' property containing 'content'
              let content = chunk.message.content;
              if (content.includes("</think>")) {endThink=true;continue;}
              if(endThink){
                controller.enqueue(encoder.encode(content));
                output+=content;
              }
              else{
                think+=content;
              }
              
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          } finally{
            console.log(`Best ${exercises.length} exercise for user ${user}:\n`+exercises)
            console.log("Think block:" + think.replace("<think>",""));
            //console.log("Output:" + output);
          }
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "Transfer-Encoding": "chunked",
        },
      }
    );
  } catch (error) {
    console.error("Ollama API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get response from LLM" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
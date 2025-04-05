"use server";
import { Ollama } from "ollama";
const user=Math.floor(Math.random() * 3864);

export async function POST(request) {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const ollama = new Ollama({ host: "http://172.20.16.1:11434/" });
 
  try {
    const { message,user } = await request.json();
    const best_3 = await fetch(`${baseUrl}/api/score_generator`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputData:user}),
    });
    if (!best_3.ok) {
      throw new Error(`Failed to fetch score_generator: ${best_3.statusText}`);
    }
    const itemNames = await best_3.json();
    var exercises=Object.values(itemNames);
    console.log(`Best ${exercises.length} exercise for user ${user}:\n`+exercises)
    exercises="Here is a list of the users' favorite exercises: "+exercises+". Use the list when the message is about exercise.";

    const constrain= "You are a gym assistant. Respond to messages only related to the users' exercise or diet. Keep your responce in english.";
    let content= constrain+message+exercises;
    
    const stream = await ollama.chat({
      model: "deepseek-r1:7b-qwen-distill-q4_K_M",
      messages: [ 
                  { role: "user", content: content }
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
            console.log("Think block:" + think.replace("<think>",""));
            console.log("Output:" + output);
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
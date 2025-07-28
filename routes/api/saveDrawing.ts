const kv = await Deno.openKv();


export const handler = {

    async POST(req: Request): Promise<Response> {

    
    
    try {
        const { id, imageData } = await req.json();
        
        await kv.set(["saved_drawings", id], { 
            id, 
            imageData, 

            timestamp: Date.now() 
        });

        
        return new Response(JSON.stringify({ success: true, id }), {
            headers: { "Content-Type": "application/json" },
        });
    } 
    
    catch (error) {
        return new Response(JSON.stringify({ error: "Failed to save drawing" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    }
};
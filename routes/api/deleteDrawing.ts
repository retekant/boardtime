const kv = await Deno.openKv();

export const handler = {
    async DELETE(req: Request): Promise<Response> {
        try {
            const {id} = await req.json();
            
            await kv.delete(["saved_drawings", id]);

            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" },
            });
        } 
        
        catch (error) {
            return new Response(JSON.stringify({error: "Failed to clear save" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    }
};
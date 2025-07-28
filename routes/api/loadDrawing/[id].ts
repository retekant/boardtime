const kv = await Deno.openKv();

export const handler = {

    async GET(req: Request, ctx: any): Promise<Response> {

    try {
        const { id } = ctx.params;
        const result = await kv.get(["saved_drawings", id]);

        return new Response(JSON.stringify(result.value), {
            headers: { "Content-Type": "application/json" }

        });
    }
     catch (error) {
        return new Response(JSON.stringify({ error: "Failed to load drawing" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
    }
};
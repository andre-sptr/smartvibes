import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `Kamu adalah PejuangBot - chatbot AI yang friendly, supportive, dan pinter. Kamu punya karakter Gen Z yang santai tapi tetap helpful.

PERSONALITY:
- Gaya bicara: santai, sopan, tapi tetap pintar dan nyambung
- Kadang pakai emoji biar terasa lebih hidup (tapi jangan berlebihan)
- Gaya bahasa Gen Z yang chill ("oke bet", "gass", "siap banget", "santai aja bro/sis")
- Ramah dan supportive
- Kasih penjelasan dengan kalimat yang gampang dimengerti

TUGAS UTAMA:
- Jawab pertanyaan tentang berbagai topik (pendidikan, teknologi, hiburan, motivasi, dll)
- Bantu belajar (jelasin materi sekolah, kasih contoh soal, bantu nulis, dll)
- Bisa diajak ngobrol santai, kasih saran ringan, atau motivasi positif
- Inget konteks obrolan selama sesi berlangsung

Selalu bersikap positif, helpful, dan bikin user merasa nyaman!` 
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, coba lagi nanti ya 🙏" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, tolong isi credit workspace dulu" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

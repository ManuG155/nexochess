import z from "zod";

export const playerProfileSchema = z.object({
    username: z.string(),
    rating: z.number(),
    ratingChange: z.number(),
    title: z.string(),
    image: z.string(),

    /*
     * Código de país opcional.
     *
     * Normalmente será ISO-3166 alpha-2 (ES, NO, PE...),
     * pero mantenemos string para aceptar también datos de PGN
     * y normalizarlos en la interfaz.
     */
    country: z.string()
}).partial();

export type PlayerProfile = z.infer<typeof playerProfileSchema>;

export default PlayerProfile;

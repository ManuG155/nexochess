import { useMemo } from "react";
import { QueryClient, useQuery } from "@tanstack/react-query";

import { Announcement } from "shared/types/Announcement";

function useAnnouncement() {
    const queryClient = useMemo(() => new QueryClient(), []);

    const { data: announcement, status, refetch } = useQuery({
        queryKey: ["announcement"],
        queryFn: async () => {
            const announcementResponse = await fetch("/api/public/announcement");

            if (!announcementResponse.ok) {
                throw new Error(
                    `Announcement request returned HTTP ${announcementResponse.status}.`
                );
            }

            const value = await announcementResponse.json() as Partial<Announcement>;

            if (
                typeof value?.content !== "string"
                || value.content.trim().length === 0
            ) {
                throw new Error("No active announcement.");
            }

            return value as Announcement;
        },
        retry: false,
        refetchOnWindowFocus: false
    }, queryClient);

    if (status != "success") return { status, refetch };

    return {
        status,
        refetch,
        announcement: announcement as Announcement
    };
}

export default useAnnouncement;

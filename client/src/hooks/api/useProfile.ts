import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { UserProfile, AuthedUserProfile } from "shared/types/UserProfile";

type PageShowListener = Parameters<typeof addEventListener<"pageshow">>[1];

interface AccountSessionResponse {
    user?: unknown;
}

export function usePublicProfile(username: string) {
    const { data: profile, status, refetch } = useQuery({
        queryKey: ["publicProfile", username],
        queryFn: async () => {
            const profileResponse = await fetch(`/api/public/profile/${username}`);
            if (!profileResponse.ok) throw new Error();
        
            const profile: UserProfile = await profileResponse.json();
        
            return profile;
        },
        refetchOnWindowFocus: false,
        retry: false
    });

    return status == "success"
        ? { profile: profile!, status, refetch }
        : { profile, status, refetch };
}

export function useAuthedProfile() {
    const {
        data: session,
        status: sessionStatus,
        refetch: refetchSession
    } = useQuery({
        queryKey: ["accountSession"],
        queryFn: async () => {
            const sessionResponse = await fetch("/auth/account/get-session");
            if (!sessionResponse.ok) throw new Error();
            if (sessionResponse.status == 204) return null;

            const session: AccountSessionResponse | null =
                await sessionResponse.json();

            return session;
        },
        refetchOnWindowFocus: false,
        retry: false
    });

    const authenticated = Boolean(session?.user);

    const {
        data: profile,
        status: profileStatus,
        refetch
    } = useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const profileResponse = await fetch("/api/account/profile");
            if (!profileResponse.ok) throw new Error();
        
            const profile: AuthedUserProfile = await profileResponse.json();
        
            return profile;
        },
        enabled: authenticated,
        refetchOnWindowFocus: false,
        retry: false
    });

    useEffect(() => {
        const refetchPersisted: PageShowListener = event => {
            if (!event.persisted) return;

            void refetchSession().then(result => {
                if (result.data?.user) void refetch();
            });
        };

        addEventListener("pageshow", refetchPersisted);

        return () => removeEventListener("pageshow", refetchPersisted);
    }, [refetch, refetchSession]);

    const status = sessionStatus == "pending"
        ? "pending"
        : sessionStatus == "error" || !authenticated
            ? "error"
            : profileStatus;

    return status == "success"
        ? { profile: profile!, status, refetch }
        : { profile, status, refetch };
}
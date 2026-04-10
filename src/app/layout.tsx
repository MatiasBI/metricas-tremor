import * as React from "react"
import { Metadata } from "next"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter"
import CssBaseline from "@mui/material/CssBaseline"
import { Roboto } from "next/font/google"
import { PublicEnvScript } from "next-runtime-env"
import { NuqsAdapter } from "nuqs/adapters/next/app"

const roboto = Roboto({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
})

export const metadata: Metadata = {
    title: {
        template: "MEEP - %s",
        default: "MEEP",
    },
    description: "Manejo Eficiente del Espacio Público",
    openGraph: {
        title: {
            template: "MEEP - %s",
            default: "MEEP",
        },
        description: "Manejo Eficiente del Espacio Público",
    },
}

export default function RootLayout(props: { children: React.ReactNode }) {
    return (
        <html className="meep-html" lang="en">
            <head>
                <PublicEnvScript />
            </head>
            <body className={roboto.className}>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                <React.Suspense
                    fallback={
                        <div className="div-loader_root_layout">
                            ...
                        </div>
                    }
                >
                    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
                        <NuqsAdapter>
                            <div className="layout-container">{props.children}</div>
                        </NuqsAdapter>
                    </AppRouterCacheProvider>
                </React.Suspense>
            </body>
        </html>
    )
}

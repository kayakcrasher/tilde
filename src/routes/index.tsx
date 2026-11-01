import { createFileRoute } from "@tanstack/react-router";
import { Tilde } from "@/components/tilde/app";

export const Route = createFileRoute("/")({ component: Tilde });

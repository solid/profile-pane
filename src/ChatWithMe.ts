import {html, TemplateResult} from "lit-html";
import {DataBrowserContext} from "pane-registry";
import {NamedNode} from "rdflib";
import {widgets} from "solid-ui";
import { asyncAppend } from "lit-html/directives/async-append";


export const ChatWithMe = (subject: NamedNode, context: DataBrowserContext): TemplateResult => {
    const logic = context.session.logic.chat;
    const longChatPane = context.session.paneRegistry.byName('long chat')

    async function* chatContainer() {
        const chatContainer = context.dom.createElement("div");

        let exists;
        try {
            exists = await logic.getChat(subject, false);
        } catch (e) {
            exists = false;
        }
        if (exists) {
            chatContainer.appendChild(longChatPane.render(exists, context, {}));
            yield chatContainer;
        } else {
            const button = widgets.button(
                context.dom,
                undefined,
                "Chat with me",
                async () => {
                    try {
                        const chat: NamedNode = await logic.getChat(subject);
                        chatContainer.innerHTML = "";
                        chatContainer.appendChild(longChatPane.render(chat, context, {}));
                    } catch (e) {
                        chatContainer.appendChild(
                            widgets.errorMessageBlock(context.dom, e.message)
                        );
                    }
                },
                { needsBorder: true }
            );
            chatContainer.appendChild(button);
            yield chatContainer;
        }
    }

    return html`
        ${asyncAppend(chatContainer())}
    `;
};
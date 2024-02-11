# Internet of Pings

## Inspiration

One of our members actually began his computing journey with networking in high school. Since Cisco is fairly large in the enterprise routing/switching game, they provide a closed-source network simulator specifically for Cisco products. Having used this application and not enjoying the closed nature of the software (including the internal vendor lock-in), we thought it would be fun to implement our own simulator to simulate as much of the TCP/IP stack with vendor agnostic (soft)hardware.

## What it does

Internet of Pings acts as a virtual networking playground, where you can add network objects, configure them, and then simulate sent traffic between them, all from the comfort of your browser. No proprietary software to install!

## How we built it

We wrote the app using Svelte as the framework, with vite as our build tool. The underlying network engine was written in pure typescript to compile directly into our bundle, and the rendering of network nodes and edges was done using PIXI, a WebGL wrapper library.

## Challenges we ran into

There were many struggles that we faced over the course of this project. The implementation of the networking engine was more complicated than initially expected, even after reducing our initial feature set. PIXI was particularly challenging to get working, as well struggles to register event handlers that integrated correctly with the existing network state to mirror it correctly, and add reactivity to the rest of the workspace.

## Accomplishments that we're proud of

We are really proud of the end product, even though it isn't complete. It was built with a lot of love, blood, sweat, and tears from the whole team.

## What we learned

Our biggest takeaway is that implementing TCP/IP from scratch is hard, and visualizing it in a way that makes sense for end users is even harder. There were many visualizations and statistics that we were interested in doing, but simply lacked the time required to execute those features faithfully. In a more pragmatic sense, we learned quite a bit about L2/L3 of the OSI model. We thought we had a decent understanding of how a router/switch would implement its routing/forwarding algorithms, but were proven wrong. Along with that, a few of our members had never used Svelte before, so that was a wonderful experience to learn a new web framework.

## What's next for Internet of Pings

The biggest next step is to flesh out all the issues we have with rendering the network graph to the end user, and all the callbacks needed to integrate that with our existing state. We have more visualizations that we hope to add, including a speed bar for adjusting packet flow. We also hope for better packet logging in the sidebar, as well as adding packet visualizations on the PIXI graph itself.

# Beetle Club North Macedonia Official

## Documentation

A full-stack web application developed for the Beetle Club North Macedonia.

## Tech Stack

* **Frontend:** Vue 3.js + Vite
* **Backend:** Next.js API
* **Object (Image) Storage:** Cloudy Object Storage
* **Backend deployment:** Vercel
* **Frontend hosting:** GOHost through cPanel

## Overview

This project is a full-stack web application developed for the Beetle Club North Macedonia.

The application is designed specifically for the club to provide a digital platform for presenting and managing its beetle collection, images, and related information.

The main purpose of the application is to support the club's digital presence by providing visitors with an accessible and optimized way to explore beetle species, view their images, and access available information through a simple and responsive gallery interface.

## Image Management & Optimization

The application uses **Cloudy Object Storage** for storing and serving images. Image delivery is optimized to improve performance and reduce unnecessary network usage.

The image system includes:

* **Image optimization** to reduce file sizes while maintaining visual quality.
* **Resolution switching**, allowing the application to load an appropriate image resolution depending on the display or requested size.
* **Lazy loading**, so images are loaded only when they are needed or become visible.
* **On-demand image loading**, where only a selected number of images are requested when the user presses a button or requests additional content, rather than loading the entire image collection at once.

This approach helps reduce initial page load times, bandwidth usage, and unnecessary requests while providing a smoother experience when browsing large collections of beetle images.




## Architecture

The application follows a simple and lightweight architecture built around a **Vue 3 frontend** and a **Next.js API backend**.

The frontend is primarily responsible for presenting the beetle gallery and interacting with the gallery service. The application avoids unnecessary complexity and keeps the client-side architecture focused on displaying and browsing the available content.

The backend provides a lightweight layer between the frontend and the **Cloudy Object Storage API**. Its primary responsibility is handling gallery image requests and applying optimization strategies before images are delivered to the client.

The image delivery system is designed to minimize unnecessary storage and bandwidth usage by supporting:

* Image optimization and compression
* Resolution switching based on the requested image size
* Lazy loading
* On-demand loading of selected numbers of images
* Controlled image retrieval through the gallery service
* Reduced unnecessary requests to the object storage provider
* Image rescaleing , supported thumbails , medium size and high end on which demand user needs.

This architecture allows the application to keep the frontend simple while moving image-delivery and optimization logic into the backend.

A major goal of this approach is **cost optimization**. Instead of pulling large numbers of full-resolution images directly from object storage, the backend controls how and when images are requested and delivered. This helps reduce **bandwidth consumption, unnecessary storage transactions, API operations, and associated object-storage costs**, while still providing a responsive gallery experience.

The architecture is intentionally minimal: **Vue 3 handles the user interface and gallery experience, the Next.js API provides the image-delivery layer, and Cloudy Object Storage handles the underlying image storage. Cloudy is configured in economic mode.**

## Deployment & Hosting

The **backend API is deployed on Vercel**. I chose Vercel because its free plan is suitable for the project's current needs, and the API's data transfer is very low. The image service I built controls image requests and applies optimization, while Cloudy Object Storage provides a second layer of optimization through resized image variants and on-demand delivery. Together, these measures help limit unnecessary data transfer and storage requests.

The **frontend is hosted by GOHost**, with the domain configured through **cPanel**.

## SEO & Google Indexing

I use **Google Search Console** for SEO monitoring and to track how the site is indexed by Google. Indexing is currently being monitored. While Google updates its results, it may occasionally show an outdated URL or redirect; use the current official site URL when this happens.



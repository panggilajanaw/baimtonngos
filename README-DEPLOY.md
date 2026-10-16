# BiodataSaya — Vercel deployment

This is a static HTML/CSS/JavaScript website. It does not require a framework, package manager, or build step.

## Deploy to Vercel

1. Upload this project to a Git repository, or import the repository into Vercel.
2. In **Project Settings → Build & Development Settings**, choose **Other** as the framework preset if Vercel asks.
3. Leave the Build Command empty.
4. Set the Output Directory to `.` (the project root).
5. Deploy.

The homepage is `index.html`. The existing `.html` page URLs and local asset paths are preserved.

## Local preview

From the project root, run a static server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Music control

The `pacar.html` page has one native audio element that uses the requested Catbox URL. Playback starts only after the visitor activates **Play Music**. The control reflects actual audio events and displays a status message if loading or playback fails. The external audio host must remain reachable for playback to work.

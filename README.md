# BloodHound Legacy 4.3.1 with CE support

A fork of [BloodHound Legacy](https://github.com/SpecterOps/BloodHound-Legacy) 4.3.1 that can display and work with data collected for BloodHound Community Edition (CE): ADCS objects, local groups and the newer attack-path edges. It also adds label, image-export and filtering improvements. The stock prebuilt queries are unchanged.

The screenshots below use a small fictional `CORP.LOCAL` domain.

## CE node icons

Every CE node kind gets CE's own icon and colour, including the ADCS kinds that Legacy drew as blank question marks: EnterpriseCA, RootCA, AIACA, NTAuthStore, CertTemplate and IssuancePolicy. Local groups and users (ADLocalGroup, ADLocalUser) and AZFederatedIdentityCredential are covered too. Low detail mode uses the same colours.

![ADCS objects drawn with CE icons](docs/screenshots/01-ce-icons.png)

## Edge filtering for every edge and every query

- **New sections** for the CE edges: ADCS (ESC1 to ESC13, GoldenCert), ADCS Control, Local Groups and CE Attack Paths. All are enabled by default.
- **Other** lists any edge type found in a drawn graph that has no row yet, so every edge type can be filtered.
- **Apply filter to every query.** Stock Legacy only applies the filter to the few queries that use the `{}` placeholder. With this on, unchecked edges also drop out of prebuilt, custom and raw queries and the Node Info counts. Queries that write to the database are never changed.
- **Recalculate** reruns the current query with the current filter.

On small windows the list scrolls inside the pane, so the footer stays visible.

![Edge Filtering pane with the CE sections](docs/screenshots/02-edge-filtering.png)

## CE Properties in Node Info

BloodHound CE collection enriches objects with extra properties, including ordinary users, computers, groups and domains (for example `system_tags`, `isaclprotected` and `doesanyinheritedacegrantownerrights`). Stock Legacy showed these only as raw keys under Extra Properties, and not at all for some node kinds.

Every Node Info panel now has a **CE Properties** section. It lists all of the node's properties with readable names, shows lists one item per line and formats dates. It starts collapsed and remembers whether you last left it open.

<img src="docs/screenshots/07-ce-properties-user.png" alt="CE Properties section in a User panel" width="420">

Node kinds that Legacy has no panel for at all (CertTemplate, EnterpriseCA, RootCA, NTAuthStore, IssuancePolicy, ADLocalGroup and so on) used to leave the Node Info tab showing the previous node. They now open to their name and kind with CE Properties expanded:

![Node Info for a certificate template](docs/screenshots/03-node-info-certtemplate.png)

## Settings

<img src="docs/screenshots/04-settings.png" alt="Settings window" width="520" align="right">

**Labels**

- **Force Labels On** (default on) keeps node and edge labels visible at every zoom level and stops the Ctrl/Cmd key from hiding node labels.
- **Label Size** sets node and edge label sizes in pixels (default 22 and 16).

**Graph Images**

- **Image Size**: a fixed size, or blank for the graph's on-screen size.
- **Image Padding**: zooms out slightly so nothing sits on the edge of the image.
- **Image Markers**: whether saved images show the High Value and Owned markers.
- **Numbered Auto-Save**: saves straight to the image folder as `00001.png`, `00002.png`, ... without asking.
- **Image Folder**: where images are saved.

<br clear="right">

## Saving graph images

The **camera button** in the menu strip saves the graph using the settings above. Right-click it to change the folder. **Export Graph > Export to PNG** uses the same exporter. The image is framed exactly as the graph is on screen:

![A graph image saved with the camera button](docs/screenshots/06-exported-image.png)

In light mode the Export Graph popup is now styled as a card:

![Export Graph popup in light mode](docs/screenshots/05-export-popup.png)

## Building

Needs Node 16 (upstream pins Electron 11 and webpack 4).

```
npm ci
npm test                 # edge filter tests
npm run build:macos      # or build:win32 / build:linux
```

On Node 17 or later, set `NODE_OPTIONS=--openssl-legacy-provider` so webpack 4 can build.

Settings and custom queries live in the app's user data folder, not in the app, so replacing an existing BloodHound Legacy install keeps them.

---

# BloodHound Legacy Edition (v4) Has Been Deprecated

This repository is for BloodHound Legacy (version 4), which was last updated in 2023 and is no longer maintained. It will be archived in the near future.

## Please Use the New BloodHound Community Edition

BloodHound Legacy has been replaced by the free BloodHound Community Edition:  
* [BloodHound Community Edition GitHub repository](https://github.com/SpecterOps/BloodHound)  
* [Installation instructions](https://bloodhound.specterops.io/get-started/quickstart/community-edition-quickstart)  
* [Full documentation](https://bloodhound.specterops.io)  

BloodHound was created by [@_wald0](https://www.twitter.com/_wald0), [@CptJesus](https://twitter.com/CptJesus), and [@harmj0y](https://twitter.com/harmj0y).

BloodHound is maintained by the [BloodHound Enterprise](https://bloodhoundenterprise.io/) team.

## Access to Deprecated Resources

You can still access the deprecated BloodHound Legacy documentation [here](https://bloodhound.readthedocs.io/en/latest/index.html).

# About BloodHound Enterprise

[BloodHound Enterprise](https://specterops.io/bloodhound-overview/) is an Attack Path Management solution that continuously maps and quantifies Active Directory attack paths. It helps eliminate millions—even billions—of attack paths within your existing architecture, removing the attacker’s easiest, most reliable, and most attractive techniques.

# License

BloodHound uses graph theory to reveal hidden relationships and
attack paths in an Active Directory environment.
Copyright (C) 2016–2025 SpecterOps Inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 
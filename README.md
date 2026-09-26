# BloodHound Legacy 4.3.1 with CE support

This fork of BloodHound Legacy 4.3.1 adds support for data collected by BloodHound Community Edition:

- **Edge Filtering** lists the CE edges (ADCS, ADCS control, local groups and CE attack paths), plus an "Other" section for any other edge type seen in a graph. "Apply filter to every query" makes unchecked edges drop out of prebuilt, custom, raw and Node Info queries too, not just the ones using the `{}` placeholder. "Recalculate" reruns the current query.
- **Node icons** use CE's icon set, including the ADCS kinds and local principals.
- **Node Info** lists every property of CE kinds Legacy has no panel for, such as CertTemplate and EnterpriseCA. Other kinds get a collapsed "All Properties" section.
- **Settings** has node and edge label sizes, Force Labels On (labels always visible, Ctrl/Cmd no longer toggles them), and graph image options: size, padding, markers, numbered auto-save and the save folder.
- **Save Image** (the camera button in the menu strip) saves the graph as a PNG. Right-click the button to choose the folder.

The stock prebuilt queries are unchanged.

## Building

Needs Node 16 (upstream pins Electron 11 and webpack 4).

```
npm ci
npm test                 # edge filter tests
npm run build:macos      # or build:win32 / build:linux
```

On Node 17 or later, set `NODE_OPTIONS=--openssl-legacy-provider` so webpack 4 can build.

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
 
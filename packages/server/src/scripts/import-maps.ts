/**
 * One-time import script: Processes map floor images (Blueprint/Darkprint/Whiteprint)
 * from a source folder and imports them into the database.
 *
 * Also imports gadget icons from the Gadgets subfolder.
 *
 * Usage:
 *   pnpm --filter @tactihub/server tsx src/scripts/import-maps.ts <source-folder>
 *
 * Example:
 *   pnpm --filter @tactihub/server tsx src/scripts/import-maps.ts "C:\Users\Niklas\Downloads\Sternab-20260211T183417Z-1-001\Sternab"
 */

import { config } from 'dotenv';
config({ path: '../../.env' });

import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { nanoid } from 'nanoid';
import { db } from '../db/connection.js';
import { maps, mapFloors, games, gadgets } from '../db/schema/index.js';
import { eq, and } from 'drizzle-orm';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// ────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────

interface FloorDef {
  name: string;
  floorNumber: number;
  blueprint: string;       // filename relative to map folder
  dark?: string;           // filename for darkprint
  white?: string;          // filename for whiteprint
}

interface MapDef {
  slug: string;
  folder: string;          // subfolder name in source
  floors: FloorDef[];
}

interface GadgetIconDef {
  gadgetName: string;      // must match seed gadget name exactly
  file: string;            // filename in Gadgets folder
}

// ────────────────────────────────────────────────────────
// Map definitions
// ────────────────────────────────────────────────────────

const MAP_DEFS: MapDef[] = [
  {
    slug: 'bank',
    folder: 'Bank Rework',
    floors: [
      { name: 'Basement', floorNumber: 1, blueprint: 'BankReworkBasementBlue.jpg', dark: 'BankReworkBasementBlack.jpg', white: 'BankReworkBasementBW.jpg' },
      { name: 'Ground Floor', floorNumber: 2, blueprint: 'BankReworkGroundFloorBlue.jpg', dark: 'BankReworkGroundFloorBlack.jpg', white: 'BankReworkGroundFloorBW.jpg' },
      { name: 'Top Floor', floorNumber: 3, blueprint: 'BankReworkTopFloorBlue.jpg', dark: 'BankReworkTopFloorBlack.jpg', white: 'BankReworkTopFloorBW.jpg' },
    ],
  },
  {
    slug: 'border',
    folder: 'Border',
    floors: [
      { name: 'Ground Floor', floorNumber: 1, blueprint: 'BorderGroundFloor.jpg', dark: 'BorderGroundFloorB.jpg', white: 'BorderGroundFloorBW.jpg' },
      { name: 'Top Floor', floorNumber: 2, blueprint: 'BorderTopFloor.jpg', dark: 'BorderTopFloorB.jpg', white: 'BorderTopFloorBW.jpg' },
    ],
  },
  {
    slug: 'coastline',
    folder: 'Coastline',
    floors: [
      { name: 'Ground Floor', floorNumber: 1, blueprint: 'CoastlineGroundFloor.jpg', dark: 'CoastlineGroundFloorB.jpg', white: 'CoastlineGroundFloorBW.jpg' },
      { name: 'Top Floor', floorNumber: 2, blueprint: 'CoastlineTopFloor.jpg', dark: 'CoastlineTopFloorB.jpg', white: 'CoastlineTopFloorBW.jpg' },
    ],
  },
  {
    slug: 'consulate',
    folder: 'Consulate Rework',
    floors: [
      { name: 'Basement', floorNumber: 1, blueprint: 'ConsulateRWBasement.jpg', dark: 'ConsulateRWBasementBlack.jpg', white: 'ConsulateRWBasementBW.jpg' },
      { name: 'Ground Floor', floorNumber: 2, blueprint: 'ConsulateRWGround.jpg', dark: 'ConsulateRWGroundB.jpg', white: 'ConsulateRWGroundBW.jpg' },
      { name: 'Top Floor', floorNumber: 3, blueprint: 'ConsulateRWTopFloorB.jpg', dark: 'ConsulateRWTopFloorBlack.jpg', white: 'ConsulateRWTopFloorBW.jpg' },
    ],
  },
  {
    slug: 'chalet',
    folder: 'Chalet Rework',
    floors: [
      { name: 'Basement', floorNumber: 1, blueprint: 'ChaletRWBasement.jpg', dark: 'ChaletRWBasementB.jpg', white: 'ChaletRWBasementBW.jpg' },
      { name: 'Ground Floor', floorNumber: 2, blueprint: 'ChaletRWGroundFloor.jpg', dark: 'ChaletRWGroundFloorB.jpg', white: 'ChaletRWGroundFloorBW.jpg' },
      { name: 'Top Floor', floorNumber: 3, blueprint: 'ChaletRWTopFloor.jpg', dark: 'ChaletRWTopFloorB.jpg', white: 'ChaletRWTopFloorBW.jpg' },
    ],
  },
  {
    slug: 'clubhouse',
    folder: 'Clubhouse',
    floors: [
      { name: 'Basement', floorNumber: 1, blueprint: 'ClubhouseBasement.jpg', dark: 'ClubhouseBasementB.jpg', white: 'ClubHouseBasementBW.jpg' },
      { name: 'Ground Floor', floorNumber: 2, blueprint: 'ClubhouseGroundFloor.jpg', dark: 'ClubhouseGroundFloorB.jpg', white: 'ClubhouseGroundFloorBW.jpg' },
      { name: 'Top Floor', floorNumber: 3, blueprint: 'ClubhouseTopFloor.jpg', dark: 'ClubhouseTopFloorB.jpg', white: 'ClubhouseTopFloorBW.jpg' },
    ],
  },
  {
    slug: 'hereford',
    folder: 'Hereford',
    floors: [
      { name: 'Basement', floorNumber: 1, blueprint: 'HerefordBasement.jpg', dark: 'HerefordBasementB.jpg' },
      { name: 'Ground Floor', floorNumber: 2, blueprint: 'HerefordGroundFloor.jpg', dark: 'HerefordGroundFloorB.jpg' },
      { name: 'First Floor', floorNumber: 3, blueprint: 'HerefordFirstFloor.jpg', dark: 'HerefordFirstFloorB.jpg' },
      { name: 'Top Floor', floorNumber: 4, blueprint: 'HerefordTopFloor.jpg', dark: 'HerefordTopFloorB.jpg' },
    ],
  },
  {
    slug: 'kafe',
    folder: 'Kafe',
    floors: [
      { name: 'Ground Floor', floorNumber: 1, blueprint: 'KafeGroundFloor.jpg', dark: 'KafeGroundFloorB.jpg', white: 'KafeGroundBW.jpg' },
      { name: 'Middle Floor', floorNumber: 2, blueprint: 'KafeMiddleFloor.jpg', dark: 'KafeMiddleFloorB.jpg', white: 'KafeMiddleFloorBW.jpg' },
      { name: 'Top Floor', floorNumber: 3, blueprint: 'KafeTopFloor.jpg', dark: 'KafeTopFloorB.jpg', white: 'KafeTopFloorBW.jpg' },
    ],
  },
  {
    slug: 'oregon',
    folder: 'Oregon Rework',
    floors: [
      { name: 'Basement', floorNumber: 1, blueprint: 'OregonRWbasement.jpg', dark: 'OregonRWbasementB.jpg', white: 'OregonRWbasementBW.jpg' },
      { name: 'Ground Floor', floorNumber: 2, blueprint: 'OregonRWgroundfloor.jpg', dark: 'OregonRWgroundfloorB.jpg', white: 'OregonRWgroundfloorBW.jpg' },
      { name: 'Tier 3', floorNumber: 3, blueprint: 'OregonRWT3.jpg', dark: 'OregonRWT3B.jpg', white: 'OregonRWT3bw.jpg' },
      { name: 'Top Floor', floorNumber: 4, blueprint: 'OregonRWTopFloor.jpg', dark: 'OregonRWTopFloorB.jpg', white: 'OregonRWTopFloorBW.jpg' },
    ],
  },
  {
    slug: 'skyscraper',
    folder: 'Skyscraper Rework',
    floors: [
      { name: 'Ground Floor', floorNumber: 1, blueprint: 'SkyscraperGroundFloor.jpg', dark: 'SkyscraperGroundFloorB.jpg', white: 'SkyscraperGroundFloorBW.jpg' },
      { name: 'Top Floor', floorNumber: 2, blueprint: 'SkyscraperTopFloor.jpg', dark: 'SkyscraperTopFloorB.jpg', white: 'SkyscraperTopFloorBW.jpg' },
    ],
  },
  {
    slug: 'theme-park',
    folder: 'Themepark',
    floors: [
      { name: 'Ground Floor', floorNumber: 1, blueprint: 'ThemeparkGroundFloor.jpg', dark: 'ThemeparkGroundFloorBlack.jpg', white: 'ThemeparkGroudFloorBW.jpg' },
      { name: 'Top Floor', floorNumber: 2, blueprint: 'ThemeparkTopFloor.jpg', dark: 'ThemeparkTopFloorBlack.jpg', white: 'ThemeparkTopFloorBW.jpg' },
    ],
  },
  {
    slug: 'villa',
    folder: 'Villa',
    floors: [
      { name: 'Basement', floorNumber: 1, blueprint: 'VillaBasement.jpg', dark: 'VillaBasementB.jpg', white: 'VillaBasementBW.jpg' },
      { name: 'Ground Floor', floorNumber: 2, blueprint: 'VillaGroundFloor.jpg', dark: 'VillaGroundFloorB.jpg', white: 'VillaGroundFloorBW.jpg' },
      { name: 'Top Floor', floorNumber: 3, blueprint: 'VillaTopFloor.jpg', dark: 'VillaTopFloorB.jpg', white: 'VillaTopFloorBW.jpg' },
    ],
  },
  {
    slug: 'favela',
    folder: 'Favela',
    floors: [
      { name: 'Basement', floorNumber: 1, blueprint: 'FavelaBasement.jpg', dark: 'FavelaBasementB.jpg' },
      { name: 'First Floor', floorNumber: 2, blueprint: 'FavelaFirstFloor.jpg', dark: 'FavelaFirstFloorB.jpg' },
      { name: 'Second Floor', floorNumber: 3, blueprint: 'FavelaSecondFloor.jpg', dark: 'FavelaSecondFloorB.jpg' },
      { name: 'Top Floor', floorNumber: 4, blueprint: 'FavelaTopFloor.jpg', dark: 'FavelaTopFloorB.jpg' },
    ],
  },
  {
    slug: 'fortress',
    folder: 'Fortress',
    floors: [
      { name: 'Ground Floor', floorNumber: 1, blueprint: 'FortressGroundFloor.jpg', dark: 'FortressGroundFloorB.jpg' },
      { name: 'Top Floor', floorNumber: 2, blueprint: 'FortressTopFloor.jpg', dark: 'FortressTopFloorB.jpg' },
    ],
  },
  {
    slug: 'house',
    folder: 'House Rework',
    floors: [
      { name: 'Basement', floorNumber: 1, blueprint: 'HouseRWBasement.jpg', dark: 'HouseRWBasementB.jpg', white: 'HouseRWBasementBW.jpg' },
      { name: 'Ground Floor', floorNumber: 2, blueprint: 'HouseRWGroundFloor.jpg', dark: 'HouseRWGroundFloorB.jpg', white: 'HouseRWGroundFloorBW.jpg' },
      { name: 'Top Floor', floorNumber: 3, blueprint: 'HouseRWTopFloor.jpg', dark: 'HouseRWTopFloorB.jpg', white: 'HouseRWTopFloorBW.jpg' },
    ],
  },
  {
    slug: 'kanal',
    folder: 'Kanal',
    floors: [
      { name: 'Lower Basement', floorNumber: 1, blueprint: 'KanalLowerBottomFloor.jpg', dark: 'KanalLowerBottomB.jpg', white: 'KanalLowerBottomBW.jpg' },
      { name: 'Basement', floorNumber: 2, blueprint: 'KanalBottomFloor.jpg', dark: 'KanalBottomFloorB.jpg', white: 'KanalBottomFloorBW.jpg' },
      { name: 'Ground Floor', floorNumber: 3, blueprint: 'KanalGroundFloor.jpg', dark: 'KanalGroundFloorB.jpg', white: 'KanalGroundFloorBW.jpg' },
      { name: 'Middle Floor', floorNumber: 4, blueprint: 'KanalM.jpg' },
      { name: 'Top Floor', floorNumber: 5, blueprint: 'KanalTopFloor.jpg', dark: 'KanalTopFloorB.jpg', white: 'KanalTopFloorBW.jpg' },
    ],
  },
  {
    slug: 'nighthaven-labs',
    folder: 'Nighthaven Labs',
    floors: [
      { name: 'Basement', floorNumber: 1, blueprint: 'NighthavenBasement.jpg', dark: 'NighthavenBasementB.jpg', white: 'NighthavenBasementBW.jpg' },
      { name: 'Ground Floor', floorNumber: 2, blueprint: 'NighthavenGroundFloor.jpg', dark: 'NighthavenGroundB.jpg', white: 'NighthavenGroundBW.jpg' },
      { name: 'Top Floor', floorNumber: 3, blueprint: 'NighthavenTopFloor.jpg', dark: 'NighthavenTopFloorB.jpg', white: 'NighthavenTopBW.jpg' },
    ],
  },
  {
    slug: 'outback',
    folder: 'Outback Rework',
    floors: [
      { name: 'Ground Floor', floorNumber: 1, blueprint: 'OutbackReworkGroundFloor.jpg', dark: 'OutbackReworkGroundFloorBlack.jpg', white: 'OutbackReworkGroundBW.jpg' },
      { name: 'Top Floor', floorNumber: 2, blueprint: 'OutbackReworkTopFloor.jpg', dark: 'OutbackReworkTopFloorBlack.jpg', white: 'OutbackReworkTopBW.jpg' },
    ],
  },
  {
    slug: 'plane',
    folder: 'Plane',
    floors: [
      { name: 'Bottom Floor', floorNumber: 1, blueprint: 'PlaneBottomFloor.jpg', dark: 'PlaneBottomFloorB.jpg' },
      { name: 'Middle Floor', floorNumber: 2, blueprint: 'PlaneMiddleFloor.jpg', dark: 'PlaneMiddleFloorB.jpg' },
      { name: 'Top Floor', floorNumber: 3, blueprint: 'PlaneTopFloor.jpg', dark: 'PlaneTopFloorB.jpg' },
    ],
  },
  {
    slug: 'tower',
    folder: 'Tower',
    floors: [
      { name: 'Bottom Floor', floorNumber: 1, blueprint: 'TowerBottomFloor.jpg', dark: 'TowerBottomFloorB.jpg' },
      { name: 'Top Floor', floorNumber: 2, blueprint: 'TowerTopFloor.jpg', dark: 'TowerTopFloorB.jpg' },
    ],
  },
  {
    slug: 'yacht',
    folder: 'Yacht',
    floors: [
      { name: 'Basement', floorNumber: 1, blueprint: 'YachtBasement.jpg', dark: 'YachtBasementB.jpg' },
      { name: 'First Floor', floorNumber: 2, blueprint: 'YachtFirstFloor.jpg', dark: 'YachtFirstFloorB.jpg' },
      { name: 'Second Floor', floorNumber: 3, blueprint: 'YachtSecondFloor.jpg', dark: 'YachtSecondFloorB.jpg' },
      { name: 'Top Floor', floorNumber: 4, blueprint: 'YachtTopFloor.jpg', dark: 'YachtTopFloorB.jpg' },
    ],
  },
];

// ────────────────────────────────────────────────────────
// Gadget icon mapping  (file → seed gadget name)
// ────────────────────────────────────────────────────────

const GADGET_ICON_DEFS: GadgetIconDef[] = [
  // Unique gadgets (named by operator)
  { gadgetName: 'Prisma', file: 'Alibi.png' },
  { gadgetName: 'Shock Wire', file: 'Bandit.png' },
  { gadgetName: 'Armor Panel', file: 'Castle.png' },
  { gadgetName: 'Yokai', file: 'Echo.png' },
  { gadgetName: 'Grzmot Mine', file: 'Ela.png' },
  { gadgetName: 'Welcome Mat', file: 'Frost.png' },
  { gadgetName: 'ADS', file: 'Jager.png' },
  { gadgetName: 'EDD', file: 'Kapkan.png' },
  { gadgetName: 'Gu Mine', file: 'Lesion.png' },
  { gadgetName: 'Evil Eye', file: 'Maestro.png' },
  { gadgetName: 'Black Mirror', file: 'Mira.png' },
  { gadgetName: 'Signal Disruptor', file: 'Mute.png' },
  { gadgetName: 'Black Eye', file: 'Valkyrie.png' },
  { gadgetName: 'Z8 Grenades', file: 'ToxicBabe.png' },
  // Secondary gadgets
  { gadgetName: 'Barbed Wire', file: 'Barb.png' },
  { gadgetName: 'Bulletproof Cam', file: 'BulletProofCam.png' },
  { gadgetName: 'Nitro Cell (C4)', file: 'NitroCell.png' },
  { gadgetName: 'Claymore', file: 'Claymore.png' },
  { gadgetName: 'Deployable Shield', file: 'Shield.png' },
  { gadgetName: 'Impact Grenade', file: 'ImpactGrenade.png' },
  { gadgetName: 'Smoke Grenade', file: 'Smoke.png' },
  // General
  { gadgetName: 'Barricade', file: 'Barricade.png' },
  { gadgetName: 'Drone', file: 'Drone.png' },
];

// ────────────────────────────────────────────────────────
// Helper: process a single image file → webp in uploads/
// ────────────────────────────────────────────────────────

async function processImage(
  srcPath: string,
  category: string,
  opts: { width?: number } = {},
): Promise<string> {
  const buffer = await fs.readFile(srcPath);
  const filename = `${nanoid()}.webp`;
  const dir = path.join(UPLOAD_DIR, category);
  await fs.mkdir(dir, { recursive: true });
  const outPath = path.join(dir, filename);

  let s = sharp(buffer);
  if (opts.width) s = s.resize(opts.width, undefined, { fit: 'inside' });
  await s.webp({ quality: 85 }).toFile(outPath);

  return `/${category}/${filename}`;
}

// ────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────

async function main() {
  const srcRoot = process.argv[2];
  if (!srcRoot) {
    console.error('Usage: tsx src/scripts/import-maps.ts <source-folder>');
    process.exit(1);
  }

  console.log(`Source folder: ${srcRoot}`);
  console.log(`Upload dir:    ${path.resolve(UPLOAD_DIR)}`);

  // Find R6 Siege game
  const [r6] = await db.select().from(games).where(eq(games.slug, 'r6'));
  if (!r6) {
    console.error('R6 Siege game not found in DB. Run seed first.');
    process.exit(1);
  }

  // ── Import map floors ────────────────────────────────
  let totalFloors = 0;

  for (const mapDef of MAP_DEFS) {
    const [map] = await db.select().from(maps)
      .where(and(eq(maps.gameId, r6.id), eq(maps.slug, mapDef.slug)));

    if (!map) {
      console.warn(`  ⚠ Map "${mapDef.slug}" not found in DB — skipping`);
      continue;
    }

    console.log(`\n📍 ${map.name} (${mapDef.folder})`);

    // Delete existing placeholder floors
    await db.delete(mapFloors).where(eq(mapFloors.mapId, map.id));

    for (const floor of mapDef.floors) {
      const blueprintSrc = path.join(srcRoot, mapDef.folder, floor.blueprint);

      try {
        await fs.access(blueprintSrc);
      } catch {
        console.warn(`  ⚠ Blueprint not found: ${floor.blueprint} — skipping floor "${floor.name}"`);
        continue;
      }

      const imagePath = await processImage(blueprintSrc, 'maps', { width: 1200 });
      let darkImagePath: string | null = null;
      let whiteImagePath: string | null = null;

      if (floor.dark) {
        const darkSrc = path.join(srcRoot, mapDef.folder, floor.dark);
        try {
          await fs.access(darkSrc);
          darkImagePath = await processImage(darkSrc, 'maps', { width: 1200 });
        } catch {
          console.warn(`  ⚠ Dark not found: ${floor.dark}`);
        }
      }

      if (floor.white) {
        const whiteSrc = path.join(srcRoot, mapDef.folder, floor.white);
        try {
          await fs.access(whiteSrc);
          whiteImagePath = await processImage(whiteSrc, 'maps', { width: 1200 });
        } catch {
          console.warn(`  ⚠ White not found: ${floor.white}`);
        }
      }

      await db.insert(mapFloors).values({
        mapId: map.id,
        name: floor.name,
        floorNumber: floor.floorNumber,
        imagePath,
        darkImagePath,
        whiteImagePath,
      });

      const variants = [
        'blueprint',
        darkImagePath ? 'dark' : null,
        whiteImagePath ? 'white' : null,
      ].filter(Boolean).join(', ');

      console.log(`  ✓ ${floor.name} (${variants})`);
      totalFloors++;
    }
  }

  console.log(`\n✅ Imported ${totalFloors} floors across ${MAP_DEFS.length} maps`);

  // ── Import gadget icons ──────────────────────────────
  const gadgetFolder = path.join(srcRoot, 'Gadgets');
  let gadgetCount = 0;

  try {
    await fs.access(gadgetFolder);
  } catch {
    console.log('\n⚠ No Gadgets folder found — skipping gadget icons');
    process.exit(0);
  }

  console.log('\n🎯 Importing gadget icons...');

  for (const gDef of GADGET_ICON_DEFS) {
    const [gadget] = await db.select().from(gadgets)
      .where(and(eq(gadgets.gameId, r6.id), eq(gadgets.name, gDef.gadgetName)));

    if (!gadget) {
      console.warn(`  ⚠ Gadget "${gDef.gadgetName}" not found in DB — skipping`);
      continue;
    }

    const iconSrc = path.join(gadgetFolder, gDef.file);
    try {
      await fs.access(iconSrc);
    } catch {
      console.warn(`  ⚠ Icon file not found: ${gDef.file} — skipping`);
      continue;
    }

    const iconPath = await processImage(iconSrc, 'gadgets');
    await db.update(gadgets).set({ icon: iconPath, updatedAt: new Date() }).where(eq(gadgets.id, gadget.id));
    console.log(`  ✓ ${gDef.gadgetName} ← ${gDef.file}`);
    gadgetCount++;
  }

  console.log(`\n✅ Imported ${gadgetCount} gadget icons`);
  console.log('\nDone!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Import error:', err);
  process.exit(1);
});

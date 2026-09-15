import type { Category } from './types'

export const vehicles: Category = {
  id: 'vehicles',
  name: { zh: '交通工具', en: 'vehicles' },
  emoji: '🚗',
  color: '#64b5f6',
  cards: [
    { id: 'car', zh: '汽车', en: 'car', emoji: '🚗', sentence: { zh: '汽车嘀嘀嘀。', en: 'The car goes beep beep.' }, scene: 'car', photos: ['Red Smart Car Side View Driveway.jpg', 'AvMalecon-LaHabanaCuba-04735.jpg'] },
    { id: 'bus', zh: '公交车', en: 'bus', emoji: '🚌', sentence: { zh: '坐公交车。', en: 'Ride the bus.' }, scene: 'city bus', photos: ['Mitaka City Bus C3012 (Ghibli Museum) at Mitaka Station Bus Stop 9, Front View.jpg', 'Setra S6 - Empresa Mosquera - 02.jpg'] },
    { id: 'train', zh: '火车', en: 'train', emoji: '🚂', sentence: { zh: '火车呜呜呜。', en: 'The train goes choo choo.' }, scene: 'steam train', photos: ['ER 797-15 steam locomotive at the station Taganrog-II IMG 7107 1725.jpg', 'UBTZ 2TE116UM-022 Cagaan Had - Sumangijn Zoo.jpg'] },
    { id: 'airplane', zh: '飞机', en: 'airplane', emoji: '✈️', sentence: { zh: '飞机飞得高。', en: 'The airplane flies high.' }, wiki: 'Airplane', scene: 'airplane flying', photos: ['Air France A380 F-HPJA.jpg', 'Biman Bangladesh Airlines Boeing 787 Dreamliner 2.jpg'] },
    { id: 'ship', zh: '大船', en: 'boat', emoji: '🚢', sentence: { zh: '大船在海上。', en: 'The boat is on the sea.' }, wiki: 'Ship', scene: 'ship sea', photos: ['Margaritaville at Sea Paradise 2025-08-03.jpg', 'Vision of The Seas cruise ship by Royal Caribbean International, in Alaska.jpg'] },
    { id: 'bicycle', zh: '自行车', en: 'bike', emoji: '🚲', sentence: { zh: '骑自行车。', en: 'Ride a bike.' }, wiki: 'Bicycle', scene: 'child riding bicycle', photos: ['Child bicycle Managing ports Altagracia.jpg', 'Helmeted boy on training wheels.jpg'] },
    { id: 'motorcycle', zh: '摩托车', en: 'motorcycle', emoji: '🏍️', sentence: { zh: '摩托车真快。', en: 'The motorcycle is fast.' }, scene: 'motorcycle', photos: ['Norton Motorcycle.jpg', '2022-09-24 Motorsport, IDM, Finale Hockenheimring 1DX 3890 by Stepro.jpg'] },
    { id: 'fire-truck', zh: '消防车', en: 'fire truck', emoji: '🚒', sentence: { zh: '消防车来了。', en: 'Here comes the fire truck.' }, wiki: 'Fire engine', scene: 'fire engine', photos: ['Former Magirus-Deutz 170D11 fire engine in Bavaria.JPG', 'ChicoCAEngine4.jpg'] },
    { id: 'ambulance', zh: '救护车', en: 'ambulance', emoji: '🚑', sentence: { zh: '救护车呜哇呜哇。', en: 'The ambulance goes wee-oo.' }, scene: 'ambulance', photos: ['Krankentransportwagen in Passau.JPG', 'Rettungswagen BRK Sprinter-20180805-RM-173219.jpg'] },
    { id: 'police-car', zh: '警车', en: 'police car', emoji: '🚓', sentence: { zh: '警车闪着灯。', en: 'The police car flashes its lights.' }, scene: 'police car lights', photos: ['Swedish police car with lights on.jpg', 'Chrysler 010.jpg'] },
    { id: 'tractor', zh: '拖拉机', en: 'tractor', emoji: '🚜', sentence: { zh: '拖拉机在田里。', en: 'The tractor is in the field.' }, scene: 'tractor field', photos: ['A tracked tractor in field by Great Moulton - geograph.org.uk - 3912810.jpg', '寶馬曳引機 N5.jpg'] },
    { id: 'taxi', zh: '出租车', en: 'taxi', emoji: '🚕', sentence: { zh: '坐出租车。', en: 'Take a taxi.' }, wiki: 'Taxicab', scene: 'taxi', photos: ['(USA-New York) NYC Medallion Cab Toyota RAV4 NY-Taxi-Y202490C 2024-06-15.jpg', 'TAXI.jpg'] },
    { id: 'truck', zh: '卡车', en: 'truck', emoji: '🚚', sentence: { zh: '卡车拉东西。', en: 'The truck carries things.' }, scene: 'truck', photos: ['Mercedes-Benz Arocs - dump truck version (1).JPG', '00 4591 Road train - Great Northern Highway (Western Australia).jpg'] },
    { id: 'subway', zh: '地铁', en: 'subway', emoji: '🚇', sentence: { zh: '坐地铁。', en: 'Ride the subway.' }, wiki: 'Rapid transit', scene: 'subway train', photos: ['Yokohama-City-Subway Type3000A 3000R.jpg', 'Kobe-subway-K10-Shinnagata-station-platform-20231001-095647.jpg'] },
    { id: 'helicopter', zh: '直升机', en: 'helicopter', emoji: '🚁', sentence: { zh: '直升机转呀转。', en: 'The helicopter spins.' }, scene: 'helicopter flying', photos: ['Bell 206L-4 LongRanger IV over Botafogo Bay, Rio de Janeiro.jpg', 'LAPD Bell 206 Jetranger.jpg'] },
    { id: 'rocket', zh: '火箭', en: 'rocket', emoji: '🚀', sentence: { zh: '火箭飞上天。', en: 'The rocket flies to space.' }, scene: 'rocket launch', photos: ['Ares I-X launch 08.jpg', 'STS-125 Atlantis Liftoff 02.jpg'] },
    { id: 'scooter', zh: '滑板车', en: 'scooter', emoji: '🛴', sentence: { zh: '我玩滑板车。', en: 'I ride my scooter.' }, wiki: 'Kick scooter', scene: 'child kick scooter', photos: ['Boy on electric scooter 5988226382 e289654724 z.jpg', 'Kids on Scooters with Public-Art Backdrop - Giessen - Germany.jpg'] },
    { id: 'sailboat', zh: '帆船', en: 'sailboat', emoji: '⛵', sentence: { zh: '帆船有帆。', en: 'The sailboat has a sail.' }, scene: 'sailboat', photos: ['Zoutelande (NL), Strand, Blick auf die Nordsee -- 2022 -- 4984.jpg', 'Segelboot Bodensee Mainau (Foto Hilarmont).JPG'] },
    { id: 'high-speed-train', zh: '高铁', en: 'high speed train', emoji: '🚄', sentence: { zh: '高铁跑得飞快。', en: 'The high speed train is fast.' }, wiki: 'High-speed rail in China', scene: 'china high speed train' },
  ],
}

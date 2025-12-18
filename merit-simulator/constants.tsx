
import React from 'react';
import { Upgrade, Realm } from './types';

export const UPGRADES: Upgrade[] = [
  {
    id: 'perpetual_machine',
    name: '功德永动机',
    description: '自动放生小鱼，功德圆满。',
    baseCost: 15,
    baseDps: 1,
    icon: '🐟'
  },
  {
    id: 'prayer_wheels',
    name: '转经轮阵列',
    description: '旋转不停，经文万世。',
    baseCost: 100,
    baseDps: 5,
    icon: '🌀'
  },
  {
    id: 'miku_shrine',
    name: '初音未来佛龛',
    description: '全息投影舞蹈，赛博供奉。',
    baseCost: 500,
    baseDps: 15,
    icon: '🎤'
  },
  {
    id: 'oracle_tube',
    name: '电子抽签筒',
    description: '随机触发吉兆，自动演算。',
    baseCost: 2500,
    baseDps: 45,
    icon: '🥢'
  },
  {
    id: 'shaolin_stage',
    name: '少林18铜人剧场',
    description: '硬核武术，镀金铜人。',
    baseCost: 12000,
    baseDps: 120,
    icon: '💪'
  },
  {
    id: 'incense_system',
    name: '智能上香系统',
    description: '环保烟雾，数据净化。',
    baseCost: 65000,
    baseDps: 400,
    icon: '💨'
  }
];

export const REALM_MILESTONES = [
  { merit: 0, realm: Realm.Mortal },
  { merit: 1000, realm: Realm.Kind },
  { merit: 10000, realm: Realm.Master },
  { merit: 100000, realm: Realm.Bodhisattva },
  { merit: 1000000, realm: Realm.LivingBuddha },
  { merit: 10000000, realm: Realm.CyberBuddha }
];

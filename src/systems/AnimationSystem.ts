// ============================================================
// LEARN FIGHT — Procedural Animation System
// ============================================================
import * as THREE from 'three';

type BoneRotations = Record<string, { times: number[]; quaternions: number[] }>;
type BonePositions = Record<string, { times: number[]; positions: number[] }>;

function eulerToQuat(x: number, y: number, z: number): number[] {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
  return [q.x, q.y, q.z, q.w];
}

function buildClip(name: string, duration: number, rotations: BoneRotations, positions?: BonePositions): THREE.AnimationClip {
  const tracks: THREE.KeyframeTrack[] = [];
  for (const [bone, data] of Object.entries(rotations)) {
    tracks.push(new THREE.QuaternionKeyframeTrack(
      `${bone}.quaternion`, data.times, data.quaternions
    ));
  }
  if (positions) {
    for (const [bone, data] of Object.entries(positions)) {
      tracks.push(new THREE.VectorKeyframeTrack(
        `${bone}.position`, data.times, data.positions
      ));
    }
  }
  return new THREE.AnimationClip(name, duration, tracks);
}

const D = Math.PI / 180;

// ============== IDLE ==============
function createIdleAnimation(): THREE.AnimationClip {
  return buildClip('idle', 2.0, {
    Root: { times: [0, 1, 2], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 0, 0)] },
    Spine: { times: [0, 1, 2], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(2*D, 0, 0), ...eulerToQuat(0, 0, 0)] },
    Head: { times: [0, 1, 2], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(-3*D, 5*D, 0), ...eulerToQuat(0, 0, 0)] },
    LeftArm: { times: [0, 1, 2], quaternions: [...eulerToQuat(0, 0, 10*D), ...eulerToQuat(3*D, 0, 12*D), ...eulerToQuat(0, 0, 10*D)] },
    RightArm: { times: [0, 1, 2], quaternions: [...eulerToQuat(0, 0, -10*D), ...eulerToQuat(3*D, 0, -12*D), ...eulerToQuat(0, 0, -10*D)] },
    LeftLeg: { times: [0, 1, 2], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 0, 0)] },
    RightLeg: { times: [0, 1, 2], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 0, 0)] },
  }, {
    Root: { times: [0, 1, 2], positions: [0, 0, 0, 0, 0.02, 0, 0, 0, 0] },
  });
}

// ============== GUARD ==============
function createGuardAnimation(): THREE.AnimationClip {
  return buildClip('guard', 1.5, {
    Root: { times: [0, 0.75, 1.5], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -15*D, 0)] },
    Spine: { times: [0, 0.75, 1.5], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(7*D, 0, 0), ...eulerToQuat(5*D, 0, 0)] },
    Head: { times: [0, 0.75, 1.5], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(-3*D, 15*D, 0), ...eulerToQuat(-5*D, 15*D, 0)] },
    LeftArm: { times: [0, 0.75, 1.5], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-65*D, 20*D, 32*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.75, 1.5], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-65*D, -20*D, -32*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    LeftLeg: { times: [0, 0.75, 1.5], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(2*D, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    RightLeg: { times: [0, 0.75, 1.5], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(2*D, -5*D, 0), ...eulerToQuat(0, -5*D, 0)] },
  }, {
    Root: { times: [0, 0.75, 1.5], positions: [0, -0.05, 0, 0, -0.03, 0, 0, -0.05, 0] },
  });
}

// ============== JAB ==============
function createJabAnimation(): THREE.AnimationClip {
  return buildClip('jab', 0.5, {
    Root: { times: [0, 0.1, 0.25, 0.5], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -5*D, 0), ...eulerToQuat(0, 10*D, 0), ...eulerToQuat(0, -15*D, 0)] },
    Spine: { times: [0, 0.1, 0.25, 0.5], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(3*D, 10*D, 0), ...eulerToQuat(2*D, 15*D, 0), ...eulerToQuat(5*D, 0, 0)] },
    LeftArm: { times: [0, 0.1, 0.25, 0.5], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-90*D, 40*D, 10*D), ...eulerToQuat(-85*D, 10*D, 5*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.1, 0.25, 0.5], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    Head: { times: [0, 0.25, 0.5], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(-5*D, 10*D, 0), ...eulerToQuat(-5*D, 15*D, 0)] },
    LeftLeg: { times: [0, 0.5], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    RightLeg: { times: [0, 0.5], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(0, -5*D, 0)] },
  });
}

// ============== CROSS ==============
function createCrossAnimation(): THREE.AnimationClip {
  return buildClip('cross', 0.6, {
    Root: { times: [0, 0.15, 0.3, 0.6], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 20*D, 0), ...eulerToQuat(0, -15*D, 0)] },
    Spine: { times: [0, 0.15, 0.3, 0.6], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(0, 15*D, 0), ...eulerToQuat(-3*D, 25*D, 0), ...eulerToQuat(5*D, 0, 0)] },
    RightArm: { times: [0, 0.15, 0.3, 0.6], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-90*D, -10*D, -10*D), ...eulerToQuat(-85*D, 30*D, 5*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    LeftArm: { times: [0, 0.3, 0.6], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-65*D, 15*D, 25*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    Head: { times: [0, 0.3, 0.6], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(-3*D, 5*D, 0), ...eulerToQuat(-5*D, 15*D, 0)] },
    LeftLeg: { times: [0, 0.6], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    RightLeg: { times: [0, 0.3, 0.6], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(10*D, 0, 0), ...eulerToQuat(0, -5*D, 0)] },
  });
}

// ============== HOOK ==============
function createHookAnimation(): THREE.AnimationClip {
  return buildClip('hook', 0.6, {
    Root: { times: [0, 0.15, 0.35, 0.6], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -30*D, 0), ...eulerToQuat(0, 15*D, 0), ...eulerToQuat(0, -15*D, 0)] },
    Spine: { times: [0, 0.15, 0.35, 0.6], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(3*D, -15*D, -5*D), ...eulerToQuat(0, 20*D, 5*D), ...eulerToQuat(5*D, 0, 0)] },
    LeftArm: { times: [0, 0.15, 0.35, 0.6], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-80*D, 40*D, 60*D), ...eulerToQuat(-70*D, 80*D, 40*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.35, 0.6], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-65*D, -15*D, -25*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    Head: { times: [0, 0.35, 0.6], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(-5*D, 10*D, 0), ...eulerToQuat(-5*D, 15*D, 0)] },
    LeftLeg: { times: [0, 0.35, 0.6], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(5*D, 15*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    RightLeg: { times: [0, 0.6], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(0, -5*D, 0)] },
  });
}

// ============== UPPERCUT ==============
function createUppercutAnimation(): THREE.AnimationClip {
  return buildClip('uppercut', 0.7, {
    Root: { times: [0, 0.15, 0.35, 0.7], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(5*D, -10*D, 0), ...eulerToQuat(-10*D, 5*D, 0), ...eulerToQuat(0, -15*D, 0)] },
    Spine: { times: [0, 0.15, 0.35, 0.7], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(15*D, 0, -5*D), ...eulerToQuat(-15*D, 10*D, 5*D), ...eulerToQuat(5*D, 0, 0)] },
    RightArm: { times: [0, 0.15, 0.35, 0.7], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-30*D, -20*D, -40*D), ...eulerToQuat(-150*D, -10*D, -20*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    LeftArm: { times: [0, 0.35, 0.7], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-60*D, 15*D, 25*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    Head: { times: [0, 0.35, 0.7], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(10*D, 10*D, 0), ...eulerToQuat(-5*D, 15*D, 0)] },
    LeftLeg: { times: [0, 0.35, 0.7], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(10*D, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    RightLeg: { times: [0, 0.35, 0.7], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(15*D, 0, 0), ...eulerToQuat(0, -5*D, 0)] },
  }, {
    Root: { times: [0, 0.15, 0.35, 0.7], positions: [0, -0.05, 0, 0, -0.15, 0, 0, 0.1, 0, 0, -0.05, 0] },
  });
}

// ============== BODY SHOT ==============
function createBodyShotAnimation(): THREE.AnimationClip {
  return buildClip('body_shot', 0.55, {
    Root: { times: [0, 0.15, 0.3, 0.55], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(5*D, -5*D, 0), ...eulerToQuat(3*D, 10*D, 0), ...eulerToQuat(0, -15*D, 0)] },
    Spine: { times: [0, 0.15, 0.3, 0.55], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(15*D, 5*D, 0), ...eulerToQuat(10*D, 15*D, 0), ...eulerToQuat(5*D, 0, 0)] },
    LeftArm: { times: [0, 0.15, 0.3, 0.55], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-40*D, 15*D, 20*D), ...eulerToQuat(-50*D, 40*D, 10*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.55], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    Head: { times: [0, 0.55], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(-5*D, 15*D, 0)] },
    LeftLeg: { times: [0, 0.55], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    RightLeg: { times: [0, 0.55], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(0, -5*D, 0)] },
  }, {
    Root: { times: [0, 0.15, 0.3, 0.55], positions: [0, -0.05, 0, 0, -0.1, 0, 0, -0.05, 0, 0, -0.05, 0] },
  });
}

// ============== LIVER SHOT ==============
function createLiverShotAnimation(): THREE.AnimationClip {
  return buildClip('liver_shot', 0.6, {
    Root: { times: [0, 0.15, 0.35, 0.6], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(5*D, 5*D, 0), ...eulerToQuat(3*D, 15*D, 0), ...eulerToQuat(0, -15*D, 0)] },
    Spine: { times: [0, 0.15, 0.35, 0.6], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(12*D, 10*D, -5*D), ...eulerToQuat(8*D, 20*D, 0), ...eulerToQuat(5*D, 0, 0)] },
    RightArm: { times: [0, 0.15, 0.35, 0.6], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-40*D, -10*D, -20*D), ...eulerToQuat(-50*D, 30*D, -5*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    LeftArm: { times: [0, 0.6], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    Head: { times: [0, 0.6], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(-5*D, 15*D, 0)] },
    LeftLeg: { times: [0, 0.6], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    RightLeg: { times: [0, 0.35, 0.6], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(10*D, 5*D, 0), ...eulerToQuat(0, -5*D, 0)] },
  });
}

// ============== OVERHAND ==============
function createOverhandAnimation(): THREE.AnimationClip {
  return buildClip('overhand', 0.75, {
    Root: { times: [0, 0.2, 0.4, 0.75], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(-5*D, -25*D, 0), ...eulerToQuat(5*D, 15*D, 0), ...eulerToQuat(0, -15*D, 0)] },
    Spine: { times: [0, 0.2, 0.4, 0.75], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(-10*D, -10*D, -5*D), ...eulerToQuat(15*D, 15*D, 5*D), ...eulerToQuat(5*D, 0, 0)] },
    RightArm: { times: [0, 0.2, 0.4, 0.75], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-160*D, -20*D, -30*D), ...eulerToQuat(-40*D, 20*D, -10*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    LeftArm: { times: [0, 0.75], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    Head: { times: [0, 0.4, 0.75], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(5*D, 5*D, 0), ...eulerToQuat(-5*D, 15*D, 0)] },
    LeftLeg: { times: [0, 0.75], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    RightLeg: { times: [0, 0.4, 0.75], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(15*D, 5*D, 0), ...eulerToQuat(0, -5*D, 0)] },
  }, {
    Root: { times: [0, 0.2, 0.4, 0.75], positions: [0, -0.05, 0, 0, 0.05, 0, 0, -0.1, 0, 0, -0.05, 0] },
  });
}

// ============== LOW KICK ==============
function createLowKickAnimation(): THREE.AnimationClip {
  return buildClip('low_kick', 0.6, {
    Root: { times: [0, 0.15, 0.35, 0.6], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -25*D, -5*D), ...eulerToQuat(0, 10*D, 5*D), ...eulerToQuat(0, -15*D, 0)] },
    Spine: { times: [0, 0.15, 0.35, 0.6], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(0, 0, -10*D), ...eulerToQuat(5*D, 0, 10*D), ...eulerToQuat(5*D, 0, 0)] },
    RightLeg: { times: [0, 0.15, 0.35, 0.6], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(-30*D, -10*D, 0), ...eulerToQuat(40*D, 20*D, 20*D), ...eulerToQuat(0, -5*D, 0)] },
    LeftLeg: { times: [0, 0.15, 0.35, 0.6], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(10*D, 10*D, 0), ...eulerToQuat(5*D, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    LeftArm: { times: [0, 0.35, 0.6], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-50*D, 30*D, 40*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.35, 0.6], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-40*D, -30*D, -40*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    Head: { times: [0, 0.6], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(-5*D, 15*D, 0)] },
  });
}

// ============== HIGH KICK ==============
function createHighKickAnimation(): THREE.AnimationClip {
  return buildClip('high_kick', 0.8, {
    Root: { times: [0, 0.2, 0.45, 0.8], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -30*D, -10*D), ...eulerToQuat(0, 15*D, 10*D), ...eulerToQuat(0, -15*D, 0)] },
    Spine: { times: [0, 0.2, 0.45, 0.8], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(-5*D, 0, -15*D), ...eulerToQuat(10*D, 0, 15*D), ...eulerToQuat(5*D, 0, 0)] },
    RightLeg: { times: [0, 0.2, 0.45, 0.8], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(-40*D, -10*D, 0), ...eulerToQuat(90*D, 20*D, 30*D), ...eulerToQuat(0, -5*D, 0)] },
    LeftLeg: { times: [0, 0.45, 0.8], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(15*D, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    LeftArm: { times: [0, 0.45, 0.8], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-30*D, 40*D, 50*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.45, 0.8], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-30*D, -40*D, -50*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    Head: { times: [0, 0.45, 0.8], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(5*D, 10*D, 0), ...eulerToQuat(-5*D, 15*D, 0)] },
  });
}

// ============== BODY KICK ==============
function createBodyKickAnimation(): THREE.AnimationClip {
  return buildClip('body_kick', 0.7, {
    Root: { times: [0, 0.2, 0.4, 0.7], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -25*D, -8*D), ...eulerToQuat(0, 10*D, 8*D), ...eulerToQuat(0, -15*D, 0)] },
    RightLeg: { times: [0, 0.2, 0.4, 0.7], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(-35*D, -10*D, 0), ...eulerToQuat(60*D, 20*D, 25*D), ...eulerToQuat(0, -5*D, 0)] },
    Spine: { times: [0, 0.4, 0.7], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(5*D, 0, 12*D), ...eulerToQuat(5*D, 0, 0)] },
    LeftLeg: { times: [0, 0.7], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    LeftArm: { times: [0, 0.4, 0.7], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-40*D, 35*D, 45*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.4, 0.7], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-35*D, -35*D, -45*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    Head: { times: [0, 0.7], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(-5*D, 15*D, 0)] },
  });
}

// ============== FRONT KICK ==============
function createFrontKickAnimation(): THREE.AnimationClip {
  return buildClip('front_kick', 0.65, {
    Root: { times: [0, 0.15, 0.35, 0.65], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(-5*D, -15*D, 0), ...eulerToQuat(5*D, -15*D, 0), ...eulerToQuat(0, -15*D, 0)] },
    RightLeg: { times: [0, 0.15, 0.35, 0.65], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(-50*D, 0, 0), ...eulerToQuat(60*D, 0, 0), ...eulerToQuat(0, -5*D, 0)] },
    Spine: { times: [0, 0.35, 0.65], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(-5*D, 0, 0), ...eulerToQuat(5*D, 0, 0)] },
    LeftLeg: { times: [0, 0.65], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    LeftArm: { times: [0, 0.65], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.65], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    Head: { times: [0, 0.65], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(-5*D, 15*D, 0)] },
  });
}

// ============== SIDE KICK ==============
function createSideKickAnimation(): THREE.AnimationClip {
  return buildClip('side_kick', 0.7, {
    Root: { times: [0, 0.2, 0.4, 0.7], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -40*D, -10*D), ...eulerToQuat(0, -60*D, 0), ...eulerToQuat(0, -15*D, 0)] },
    RightLeg: { times: [0, 0.2, 0.4, 0.7], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(-40*D, 0, -20*D), ...eulerToQuat(50*D, 0, 30*D), ...eulerToQuat(0, -5*D, 0)] },
    Spine: { times: [0, 0.4, 0.7], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(0, 0, -15*D), ...eulerToQuat(5*D, 0, 0)] },
    LeftLeg: { times: [0, 0.7], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    LeftArm: { times: [0, 0.4, 0.7], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-50*D, 40*D, 50*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.4, 0.7], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-40*D, -40*D, -40*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    Head: { times: [0, 0.7], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(-5*D, 15*D, 0)] },
  });
}

// ============== ROUNDHOUSE ==============
function createRoundhouseAnimation(): THREE.AnimationClip {
  return buildClip('roundhouse', 0.85, {
    Root: { times: [0, 0.2, 0.5, 0.85], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -40*D, -5*D), ...eulerToQuat(0, 30*D, 5*D), ...eulerToQuat(0, -15*D, 0)] },
    RightLeg: { times: [0, 0.2, 0.5, 0.85], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(-45*D, -15*D, 0), ...eulerToQuat(70*D, 30*D, 30*D), ...eulerToQuat(0, -5*D, 0)] },
    Spine: { times: [0, 0.5, 0.85], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(0, 15*D, 10*D), ...eulerToQuat(5*D, 0, 0)] },
    LeftLeg: { times: [0, 0.5, 0.85], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(10*D, 15*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    LeftArm: { times: [0, 0.5, 0.85], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-30*D, 50*D, 60*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.5, 0.85], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-20*D, -50*D, -50*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    Head: { times: [0, 0.5, 0.85], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(0, 5*D, 0), ...eulerToQuat(-5*D, 15*D, 0)] },
  });
}

// ============== SPINNING KICK ==============
function createSpinningKickAnimation(): THREE.AnimationClip {
  return buildClip('spinning_kick', 1.0, {
    Root: { times: [0, 0.25, 0.5, 0.75, 1.0], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, 90*D, 0), ...eulerToQuat(0, 180*D, 5*D), ...eulerToQuat(0, 270*D, 0), ...eulerToQuat(0, 345*D, 0)] },
    RightLeg: { times: [0, 0.25, 0.5, 0.75, 1.0], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(-20*D, 0, 0), ...eulerToQuat(80*D, 0, 30*D), ...eulerToQuat(40*D, 0, 15*D), ...eulerToQuat(0, -5*D, 0)] },
    Spine: { times: [0, 0.5, 1.0], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(-5*D, 0, 10*D), ...eulerToQuat(5*D, 0, 0)] },
    LeftLeg: { times: [0, 0.5, 1.0], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(15*D, 0, 0), ...eulerToQuat(0, 10*D, 0)] },
    LeftArm: { times: [0, 0.5, 1.0], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-30*D, 50*D, 60*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.5, 1.0], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-30*D, -40*D, -50*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    Head: { times: [0, 0.5, 1.0], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(-5*D, 0, 0), ...eulerToQuat(-5*D, 15*D, 0)] },
  });
}

// ============== BLOCK ==============
function createBlockAnimation(): THREE.AnimationClip {
  return buildClip('block', 0.4, {
    Root: { times: [0, 0.1, 0.4], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(5*D, -15*D, 0), ...eulerToQuat(0, -15*D, 0)] },
    Spine: { times: [0, 0.1, 0.4], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(10*D, 0, 0), ...eulerToQuat(5*D, 0, 0)] },
    LeftArm: { times: [0, 0.1, 0.4], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-90*D, 30*D, 40*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.1, 0.4], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-90*D, -30*D, -40*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    Head: { times: [0, 0.1, 0.4], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(-10*D, 10*D, 0), ...eulerToQuat(-5*D, 15*D, 0)] },
    LeftLeg: { times: [0, 0.4], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    RightLeg: { times: [0, 0.4], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(0, -5*D, 0)] },
  }, {
    Root: { times: [0, 0.1, 0.4], positions: [0, -0.05, 0, 0, -0.1, 0, 0, -0.05, 0] },
  });
}

// ============== DODGE (SLIP LEFT) ==============
function createDodgeLeftAnimation(): THREE.AnimationClip {
  return buildClip('dodge_left', 0.6, {
    Root: { times: [0, 0.2, 0.4, 0.6], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -15*D, 0)] },
    Spine: { times: [0, 0.2, 0.4, 0.6], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(20*D, 0, 30*D), ...eulerToQuat(15*D, 0, 20*D), ...eulerToQuat(5*D, 0, 0)] },
    Head: { times: [0, 0.2, 0.4, 0.6], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(-10*D, 5*D, -20*D), ...eulerToQuat(-5*D, 10*D, -10*D), ...eulerToQuat(-5*D, 15*D, 0)] },
    LeftArm: { times: [0, 0.2, 0.6], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-90*D, 40*D, 50*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.2, 0.6], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-60*D, -40*D, -50*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    LeftLeg: { times: [0, 0.2, 0.6], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(-10*D, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    RightLeg: { times: [0, 0.2, 0.6], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(10*D, -5*D, 0), ...eulerToQuat(0, -5*D, 0)] },
  }, {
    Root: { times: [0, 0.2, 0.4, 0.6], positions: [0, -0.05, 0, -0.2, -0.15, 0.1, -0.1, -0.1, 0.05, 0, -0.05, 0] },
  });
}

// ============== DODGE (SLIP RIGHT) ==============
function createDodgeRightAnimation(): THREE.AnimationClip {
  return buildClip('dodge_right', 0.6, {
    Root: { times: [0, 0.2, 0.4, 0.6], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -15*D, 0)] },
    Spine: { times: [0, 0.2, 0.4, 0.6], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(20*D, 0, -30*D), ...eulerToQuat(15*D, 0, -20*D), ...eulerToQuat(5*D, 0, 0)] },
    Head: { times: [0, 0.2, 0.4, 0.6], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(-10*D, 25*D, 20*D), ...eulerToQuat(-5*D, 20*D, 10*D), ...eulerToQuat(-5*D, 15*D, 0)] },
    LeftArm: { times: [0, 0.2, 0.6], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-60*D, 40*D, 50*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.2, 0.6], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-90*D, -40*D, -50*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    LeftLeg: { times: [0, 0.2, 0.6], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(10*D, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    RightLeg: { times: [0, 0.2, 0.6], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(-10*D, -5*D, 0), ...eulerToQuat(0, -5*D, 0)] },
  }, {
    Root: { times: [0, 0.2, 0.4, 0.6], positions: [0, -0.05, 0, 0.2, -0.15, 0.1, 0.1, -0.1, 0.05, 0, -0.05, 0] },
  });
}

// ============== HIT REACTION (HEAD) ==============
function createHitHeadAnimation(): THREE.AnimationClip {
  return buildClip('hit_head', 0.5, {
    Root: { times: [0, 0.1, 0.3, 0.5], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(-3*D, 10*D, 0), ...eulerToQuat(0, -5*D, 0), ...eulerToQuat(0, 0, 0)] },
    Spine: { times: [0, 0.1, 0.5], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(-5*D, 10*D, 5*D), ...eulerToQuat(0, 0, 0)] },
    Head: { times: [0, 0.1, 0.3, 0.5], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(15*D, 20*D, 10*D), ...eulerToQuat(-5*D, -5*D, 0), ...eulerToQuat(0, 0, 0)] },
    LeftArm: { times: [0, 0.1, 0.5], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-50*D, 30*D, 40*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.1, 0.5], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-50*D, -30*D, -40*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    LeftLeg: { times: [0, 0.5], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 0, 0)] },
    RightLeg: { times: [0, 0.1, 0.5], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(-5*D, 0, 0), ...eulerToQuat(0, 0, 0)] },
  }, {
    Root: { times: [0, 0.1, 0.5], positions: [0, 0, 0, 0, 0, 0.05, 0, 0, 0] },
  });
}

// ============== HIT REACTION (BODY) ==============
function createHitBodyAnimation(): THREE.AnimationClip {
  return buildClip('hit_body', 0.5, {
    Root: { times: [0, 0.1, 0.5], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(10*D, 0, 0), ...eulerToQuat(0, 0, 0)] },
    Spine: { times: [0, 0.1, 0.3, 0.5], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(20*D, 0, 5*D), ...eulerToQuat(10*D, 0, 0), ...eulerToQuat(0, 0, 0)] },
    Head: { times: [0, 0.1, 0.5], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(15*D, 0, 0), ...eulerToQuat(0, 0, 0)] },
    LeftArm: { times: [0, 0.1, 0.5], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-40*D, 10*D, 20*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.1, 0.5], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-40*D, -10*D, -20*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    LeftLeg: { times: [0, 0.5], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 0, 0)] },
    RightLeg: { times: [0, 0.5], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 0, 0)] },
  }, {
    Root: { times: [0, 0.1, 0.5], positions: [0, 0, 0, 0, -0.05, 0.05, 0, 0, 0] },
  });
}

// ============== KNOCKDOWN ==============
function createKnockdownAnimation(): THREE.AnimationClip {
  return buildClip('knockdown', 1.2, {
    Root: { times: [0, 0.2, 0.5, 0.8, 1.2], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(-10*D, 15*D, 0), ...eulerToQuat(-30*D, 20*D, 10*D), ...eulerToQuat(-70*D, 10*D, 0), ...eulerToQuat(-85*D, 0, 0)] },
    Spine: { times: [0, 0.5, 1.2], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(-20*D, 10*D, 10*D), ...eulerToQuat(-10*D, 0, 0)] },
    Head: { times: [0, 0.2, 0.5, 1.2], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(20*D, 20*D, 10*D), ...eulerToQuat(30*D, 10*D, 0), ...eulerToQuat(20*D, 0, 0)] },
    LeftArm: { times: [0, 0.5, 1.2], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-20*D, 60*D, 70*D), ...eulerToQuat(0, 50*D, 80*D)] },
    RightArm: { times: [0, 0.5, 1.2], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-20*D, -60*D, -70*D), ...eulerToQuat(0, -50*D, -80*D)] },
    LeftLeg: { times: [0, 0.5, 1.2], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(-30*D, 10*D, 0), ...eulerToQuat(-20*D, 5*D, 0)] },
    RightLeg: { times: [0, 0.5, 1.2], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(-40*D, -10*D, 0), ...eulerToQuat(-25*D, -5*D, 0)] },
  }, {
    Root: { times: [0, 0.2, 0.5, 0.8, 1.2], positions: [0, 0, 0, 0, 0.05, 0.1, 0, -0.2, 0.3, 0, -0.5, 0.5, 0, -0.7, 0.6] },
  });
}

// ============== VICTORY ==============
function createVictoryAnimation(): THREE.AnimationClip {
  return buildClip('victory', 2.0, {
    Root: { times: [0, 0.5, 1.0, 1.5, 2.0], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 0, 0), ...eulerToQuat(-5*D, 0, 0), ...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 0, 0)] },
    Spine: { times: [0, 0.5, 1.0, 2.0], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(-10*D, 0, 0), ...eulerToQuat(-15*D, 0, 0), ...eulerToQuat(0, 0, 0)] },
    Head: { times: [0, 0.5, 1.0, 2.0], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(-20*D, 0, 0), ...eulerToQuat(-30*D, 0, 0), ...eulerToQuat(0, 0, 0)] },
    LeftArm: { times: [0, 0.5, 1.0, 1.5, 2.0], quaternions: [...eulerToQuat(0, 0, 10*D), ...eulerToQuat(-120*D, 20*D, 30*D), ...eulerToQuat(-170*D, 10*D, 20*D), ...eulerToQuat(-160*D, 15*D, 25*D), ...eulerToQuat(-170*D, 10*D, 20*D)] },
    RightArm: { times: [0, 0.5, 1.0, 1.5, 2.0], quaternions: [...eulerToQuat(0, 0, -10*D), ...eulerToQuat(-120*D, -20*D, -30*D), ...eulerToQuat(-170*D, -10*D, -20*D), ...eulerToQuat(-160*D, -15*D, -25*D), ...eulerToQuat(-170*D, -10*D, -20*D)] },
    LeftLeg: { times: [0, 2.0], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 0, 0)] },
    RightLeg: { times: [0, 2.0], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 0, 0)] },
  });
}

// ============== DEFEAT ==============
function createDefeatAnimation(): THREE.AnimationClip {
  return buildClip('defeat', 2.0, {
    Root: { times: [0, 0.5, 1.0, 2.0], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(10*D, 0, 0), ...eulerToQuat(15*D, 0, 0), ...eulerToQuat(15*D, 0, 0)] },
    Spine: { times: [0, 0.5, 1.0, 2.0], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(20*D, 0, 0), ...eulerToQuat(30*D, 0, 5*D), ...eulerToQuat(30*D, 0, 5*D)] },
    Head: { times: [0, 0.5, 1.0, 2.0], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(25*D, 0, 0), ...eulerToQuat(35*D, 10*D, 0), ...eulerToQuat(35*D, 10*D, 0)] },
    LeftArm: { times: [0, 1.0, 2.0], quaternions: [...eulerToQuat(0, 0, 10*D), ...eulerToQuat(10*D, 0, 15*D), ...eulerToQuat(10*D, 0, 15*D)] },
    RightArm: { times: [0, 1.0, 2.0], quaternions: [...eulerToQuat(0, 0, -10*D), ...eulerToQuat(10*D, 0, -15*D), ...eulerToQuat(10*D, 0, -15*D)] },
    LeftLeg: { times: [0, 1.0, 2.0], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(5*D, 5*D, 0), ...eulerToQuat(5*D, 5*D, 0)] },
    RightLeg: { times: [0, 1.0, 2.0], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(5*D, -5*D, 0), ...eulerToQuat(5*D, -5*D, 0)] },
  }, {
    Root: { times: [0, 0.5, 1.0, 2.0], positions: [0, 0, 0, 0, -0.1, 0, 0, -0.3, 0, 0, -0.3, 0] },
  });
}

// ============== WALK ==============
function createWalkAnimation(): THREE.AnimationClip {
  return buildClip('walk', 1.0, {
    Root: { times: [0, 0.25, 0.5, 0.75, 1.0], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 0, 0)] },
    Spine: { times: [0, 0.5, 1.0], quaternions: [...eulerToQuat(3*D, 0, 0), ...eulerToQuat(3*D, 0, 0), ...eulerToQuat(3*D, 0, 0)] },
    LeftArm: { times: [0, 0.25, 0.5, 0.75, 1.0], quaternions: [...eulerToQuat(-20*D, 0, 10*D), ...eulerToQuat(20*D, 0, 10*D), ...eulerToQuat(-20*D, 0, 10*D), ...eulerToQuat(-40*D, 0, 10*D), ...eulerToQuat(-20*D, 0, 10*D)] },
    RightArm: { times: [0, 0.25, 0.5, 0.75, 1.0], quaternions: [...eulerToQuat(20*D, 0, -10*D), ...eulerToQuat(-20*D, 0, -10*D), ...eulerToQuat(20*D, 0, -10*D), ...eulerToQuat(40*D, 0, -10*D), ...eulerToQuat(20*D, 0, -10*D)] },
    LeftLeg: { times: [0, 0.25, 0.5, 0.75, 1.0], quaternions: [...eulerToQuat(20*D, 0, 0), ...eulerToQuat(-20*D, 0, 0), ...eulerToQuat(20*D, 0, 0), ...eulerToQuat(30*D, 0, 0), ...eulerToQuat(20*D, 0, 0)] },
    RightLeg: { times: [0, 0.25, 0.5, 0.75, 1.0], quaternions: [...eulerToQuat(-20*D, 0, 0), ...eulerToQuat(20*D, 0, 0), ...eulerToQuat(-20*D, 0, 0), ...eulerToQuat(-30*D, 0, 0), ...eulerToQuat(-20*D, 0, 0)] },
    Head: { times: [0, 1.0], quaternions: [...eulerToQuat(0, 0, 0), ...eulerToQuat(0, 0, 0)] },
  }, {
    Root: { times: [0, 0.25, 0.5, 0.75, 1.0], positions: [0, 0, 0, 0, 0.03, 0, 0, 0, 0, 0, 0.03, 0, 0, 0, 0] },
  });
}

// ============== GET UP ==============
function createGetupAnimation(): THREE.AnimationClip {
  return buildClip('getup', 1.5, {
    Root: { times: [0, 0.5, 1.0, 1.5], quaternions: [...eulerToQuat(-85*D, 0, 0), ...eulerToQuat(-45*D, 0, 0), ...eulerToQuat(-15*D, 0, 0), ...eulerToQuat(0, 0, 0)] },
    Spine: { times: [0, 1.0, 1.5], quaternions: [...eulerToQuat(-10*D, 0, 0), ...eulerToQuat(15*D, 0, 0), ...eulerToQuat(0, 0, 0)] },
    Head: { times: [0, 1.0, 1.5], quaternions: [...eulerToQuat(20*D, 0, 0), ...eulerToQuat(-10*D, 0, 0), ...eulerToQuat(0, 0, 0)] },
    LeftArm: { times: [0, 0.5, 1.5], quaternions: [...eulerToQuat(0, 50*D, 80*D), ...eulerToQuat(-30*D, 30*D, 50*D), ...eulerToQuat(0, 0, 10*D)] },
    RightArm: { times: [0, 0.5, 1.5], quaternions: [...eulerToQuat(0, -50*D, -80*D), ...eulerToQuat(-30*D, -30*D, -50*D), ...eulerToQuat(0, 0, -10*D)] },
    LeftLeg: { times: [0, 0.5, 1.0, 1.5], quaternions: [...eulerToQuat(-20*D, 5*D, 0), ...eulerToQuat(-40*D, 10*D, 0), ...eulerToQuat(-60*D, 10*D, 0), ...eulerToQuat(0, 0, 0)] },
    RightLeg: { times: [0, 0.5, 1.0, 1.5], quaternions: [...eulerToQuat(-25*D, -5*D, 0), ...eulerToQuat(-30*D, -5*D, 0), ...eulerToQuat(-50*D, 0, 0), ...eulerToQuat(0, 0, 0)] },
  }, {
    Root: { times: [0, 0.5, 1.0, 1.5], positions: [0, -0.7, 0.6, 0, -0.4, 0.3, 0, -0.1, 0.1, 0, 0, 0] },
  });
}

// ============== WALK FORWARD ==============
function createWalkForwardAnimation(): THREE.AnimationClip {
  return buildClip('walk_forward', 1.0, {
    Root: { times: [0, 0.25, 0.5, 0.75, 1.0], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -15*D, 0)] },
    Spine: { times: [0, 0.5, 1.0], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(5*D, 0, 0), ...eulerToQuat(5*D, 0, 0)] },
    LeftLeg: { times: [0, 0.25, 0.5, 0.75, 1.0], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(30*D, 10*D, 0), ...eulerToQuat(0, 10*D, 0), ...eulerToQuat(-20*D, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    RightLeg: { times: [0, 0.25, 0.5, 0.75, 1.0], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(-20*D, -5*D, 0), ...eulerToQuat(0, -5*D, 0), ...eulerToQuat(30*D, -5*D, 0), ...eulerToQuat(0, -5*D, 0)] },
    LeftArm: { times: [0, 0.5, 1.0], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-60*D, 20*D, 30*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.5, 1.0], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-60*D, -20*D, -30*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
  }, {
    Root: { times: [0, 0.25, 0.5, 0.75, 1.0], positions: [0, -0.05, 0, 0, 0.02, 0, 0, -0.05, 0, 0, 0.02, 0, 0, -0.05, 0] },
  });
}

// ============== WALK BACKWARD ==============
function createWalkBackwardAnimation(): THREE.AnimationClip {
  return buildClip('walk_backward', 1.0, {
    Root: { times: [0, 0.5, 1.0], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -15*D, 0)] },
    Spine: { times: [0, 0.5, 1.0], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(0, 0, 0), ...eulerToQuat(5*D, 0, 0)] },
    LeftLeg: { times: [0, 0.25, 0.5, 0.75, 1.0], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(-20*D, 10*D, 0), ...eulerToQuat(0, 10*D, 0), ...eulerToQuat(30*D, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    RightLeg: { times: [0, 0.25, 0.5, 0.75, 1.0], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(30*D, -5*D, 0), ...eulerToQuat(0, -5*D, 0), ...eulerToQuat(-20*D, -5*D, 0), ...eulerToQuat(0, -5*D, 0)] },
    LeftArm: { times: [0, 0.5, 1.0], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.5, 1.0], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
  }, {
    Root: { times: [0, 0.25, 0.5, 0.75, 1.0], positions: [0, -0.05, 0, 0, 0.02, 0, 0, -0.05, 0, 0, 0.02, 0, 0, -0.05, 0] },
  });
}

// ============== CIRCLE LEFT ==============
function createCircleLeftAnimation(): THREE.AnimationClip {
  return buildClip('circle_left', 0.8, {
    Root: { times: [0, 0.4, 0.8], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -15*D, 5*D), ...eulerToQuat(0, -15*D, 0)] },
    Spine: { times: [0, 0.4, 0.8], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(5*D, 0, -5*D), ...eulerToQuat(5*D, 0, 0)] },
    LeftLeg: { times: [0, 0.2, 0.4, 0.6, 0.8], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(10*D, 10*D, 15*D), ...eulerToQuat(0, 10*D, 0), ...eulerToQuat(0, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    RightLeg: { times: [0, 0.2, 0.4, 0.6, 0.8], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(0, -5*D, 0), ...eulerToQuat(0, -5*D, 0), ...eulerToQuat(10*D, -5*D, 15*D), ...eulerToQuat(0, -5*D, 0)] },
    LeftArm: { times: [0, 0.8], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.8], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
  }, {
    Root: { times: [0, 0.2, 0.4, 0.6, 0.8], positions: [0, -0.05, 0, 0, 0.02, 0, 0, -0.05, 0, 0, 0.02, 0, 0, -0.05, 0] },
  });
}

// ============== CIRCLE RIGHT ==============
function createCircleRightAnimation(): THREE.AnimationClip {
  return buildClip('circle_right', 0.8, {
    Root: { times: [0, 0.4, 0.8], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -15*D, -5*D), ...eulerToQuat(0, -15*D, 0)] },
    Spine: { times: [0, 0.4, 0.8], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(5*D, 0, 5*D), ...eulerToQuat(5*D, 0, 0)] },
    RightLeg: { times: [0, 0.2, 0.4, 0.6, 0.8], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(10*D, -5*D, -15*D), ...eulerToQuat(0, -5*D, 0), ...eulerToQuat(0, -5*D, 0), ...eulerToQuat(0, -5*D, 0)] },
    LeftLeg: { times: [0, 0.2, 0.4, 0.6, 0.8], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(0, 10*D, 0), ...eulerToQuat(0, 10*D, 0), ...eulerToQuat(10*D, 10*D, -15*D), ...eulerToQuat(0, 10*D, 0)] },
    LeftArm: { times: [0, 0.8], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.8], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
  }, {
    Root: { times: [0, 0.2, 0.4, 0.6, 0.8], positions: [0, -0.05, 0, 0, 0.02, 0, 0, -0.05, 0, 0, 0.02, 0, 0, -0.05, 0] },
  });
}

// ============== STUN ==============
function createStunAnimation(): THREE.AnimationClip {
  return buildClip('stun', 1.0, {
    Root: { times: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1.0], quaternions: [...eulerToQuat(0, -15*D, 0), ...eulerToQuat(-5*D, -10*D, -5*D), ...eulerToQuat(5*D, -20*D, 5*D), ...eulerToQuat(-3*D, -10*D, -3*D), ...eulerToQuat(3*D, -20*D, 3*D), ...eulerToQuat(0, -15*D, 0), ...eulerToQuat(0, -15*D, 0)] },
    Spine: { times: [0, 0.1, 0.5, 1.0], quaternions: [...eulerToQuat(5*D, 0, 0), ...eulerToQuat(-15*D, 10*D, 5*D), ...eulerToQuat(-5*D, -10*D, -5*D), ...eulerToQuat(5*D, 0, 0)] },
    Head: { times: [0, 0.1, 0.5, 1.0], quaternions: [...eulerToQuat(-5*D, 15*D, 0), ...eulerToQuat(20*D, 20*D, 15*D), ...eulerToQuat(10*D, -10*D, -10*D), ...eulerToQuat(-5*D, 15*D, 0)] },
    LeftArm: { times: [0, 0.1, 0.5, 1.0], quaternions: [...eulerToQuat(-70*D, 20*D, 30*D), ...eulerToQuat(-20*D, 40*D, 50*D), ...eulerToQuat(-40*D, 10*D, 20*D), ...eulerToQuat(-70*D, 20*D, 30*D)] },
    RightArm: { times: [0, 0.1, 0.5, 1.0], quaternions: [...eulerToQuat(-70*D, -20*D, -30*D), ...eulerToQuat(-20*D, -40*D, -50*D), ...eulerToQuat(-40*D, -10*D, -20*D), ...eulerToQuat(-70*D, -20*D, -30*D)] },
    LeftLeg: { times: [0, 0.1, 0.5, 1.0], quaternions: [...eulerToQuat(0, 10*D, 0), ...eulerToQuat(-10*D, 10*D, 0), ...eulerToQuat(0, 10*D, 0), ...eulerToQuat(0, 10*D, 0)] },
    RightLeg: { times: [0, 0.1, 0.5, 1.0], quaternions: [...eulerToQuat(0, -5*D, 0), ...eulerToQuat(-15*D, -5*D, 0), ...eulerToQuat(0, -5*D, 0), ...eulerToQuat(0, -5*D, 0)] },
  }, {
    Root: { times: [0, 0.1, 0.5, 1.0], positions: [0, -0.05, 0, 0, -0.15, 0, 0, -0.05, 0, 0, -0.05, 0] },
  });
}

// ============== EXPORT ALL ANIMATIONS ==============
const animationCache: Record<string, THREE.AnimationClip> = {};

const animationFactories: Record<string, () => THREE.AnimationClip> = {
  idle: createIdleAnimation,
  guard: createGuardAnimation,
  walk: createWalkAnimation,
  walk_forward: createWalkForwardAnimation,
  walk_backward: createWalkBackwardAnimation,
  circle_left: createCircleLeftAnimation,
  circle_right: createCircleRightAnimation,
  stun: createStunAnimation,
  jab: createJabAnimation,
  cross: createCrossAnimation,
  hook: createHookAnimation,
  uppercut: createUppercutAnimation,
  body_shot: createBodyShotAnimation,
  liver_shot: createLiverShotAnimation,
  overhand: createOverhandAnimation,
  low_kick: createLowKickAnimation,
  body_kick: createBodyKickAnimation,
  high_kick: createHighKickAnimation,
  front_kick: createFrontKickAnimation,
  side_kick: createSideKickAnimation,
  roundhouse: createRoundhouseAnimation,
  spinning_kick: createSpinningKickAnimation,
  block: createBlockAnimation,
  defend: createBlockAnimation,
  dodge_left: createDodgeLeftAnimation,
  dodge_right: createDodgeRightAnimation,
  dodge: () => (Math.random() > 0.5 ? createDodgeLeftAnimation() : createDodgeRightAnimation()),
  heavy_attack: createOverhandAnimation,
  light_attack: createJabAnimation,
  special: createSpinningKickAnimation,
  special_charge: createGuardAnimation,
  counter_attack: createHookAnimation,
  hit_head: createHitHeadAnimation,
  hit_body: createHitBodyAnimation,
  knockdown: createKnockdownAnimation,
  getup: createGetupAnimation,
  victory: createVictoryAnimation,
  defeat: createDefeatAnimation,
};

export function getAnimation(name: string): THREE.AnimationClip {
  if (!animationCache[name]) {
    const factory = animationFactories[name];
    if (!factory) {
      console.warn(`Animation "${name}" not found, using idle`);
      return getAnimation('idle');
    }
    animationCache[name] = factory();
  }
  return animationCache[name];
}

export function getAllAnimations(): Record<string, THREE.AnimationClip> {
  const all: Record<string, THREE.AnimationClip> = {};
  for (const name of Object.keys(animationFactories)) {
    all[name] = getAnimation(name);
  }
  return all;
}

export function getAnimationNames(): string[] {
  return Object.keys(animationFactories);
}

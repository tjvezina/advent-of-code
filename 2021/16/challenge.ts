import AbstractChallenge, { Answer } from '@app/abstract-challenge';

enum PacketType {
  Sum = 0,
  Product = 1,
  Minimum = 2,
  Maximum = 3,
  Literal = 4,
  GreaterThan = 5,
  LessThan = 6,
  EqualTo = 7,
}

enum LengthType {
  BitLength = 0,
  PacketCount = 1,
}

type Packet = {
  version: number,
  typeID: number,
  value?: number,
  subpackets?: Packet[],
};

export default class Challenge extends AbstractChallenge {
  title = 'Packet Decoder';

  binary!: string;
  pointer = 0;

  packet!: Packet;

  init(): void {
    this.binary = [...this.input].map(hex => parseInt(hex, 16).toString(2).padStart(4, '0')).join('');
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 936;
  async solvePart1(): Promise<[string, Answer]> {
    this.packet = this.decodePacket();

    const sumVersions = function (packet: Packet): number {
      let sum = packet.version;
      if (packet.subpackets !== undefined) {
        sum += packet.subpackets.map(sumVersions).reduce((a, b) => a + b);
      }
      return sum;
    };

    return ['The sum of all version numbers found in the BITS transmission is ', sumVersions(this.packet)];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 6802496672062;
  solvePart2(): [string, Answer] {
    return ['The BITS transmission output after evaluation is ', this.evaluate(this.packet)];
  }

  readBits(length: number): string {
    const i = this.pointer;
    const bits = this.binary.slice(i, i + length);
    this.pointer += length;
    return bits;
  }

  readNumber(length: number): number { return parseInt(this.readBits(length), 2); }

  decodePacket(): Packet {
    const packet = {
      version: this.readNumber(3),
      typeID: this.readNumber(3),
    } as Packet;

    if (packet.typeID === PacketType.Literal) {
      packet.value = this.decodeLiteralValue();
    } else {
      packet.subpackets = [];
      const lengthTypeID = this.readNumber(1);
      if (lengthTypeID === LengthType.BitLength) {
        const bitLength = this.readNumber(15);
        const startPointer = this.pointer;
        do {
          packet.subpackets.push(this.decodePacket());
        } while (this.pointer - startPointer < bitLength);
      } else if (lengthTypeID === LengthType.PacketCount) {
        const packetCount = this.readNumber(11);
        for (let i = 0; i < packetCount; i++) {
          packet.subpackets.push(this.decodePacket());
        }
      }
    }

    return packet;
  }

  decodeLiteralValue(): number {
    let binaryValue = '';

    let groupBit;
    do {
      groupBit = this.readBits(1);
      binaryValue += this.readBits(4);
    } while (groupBit === '1');

    return parseInt(binaryValue, 2);
  }

  evaluate(packet: Packet): number {
    if (packet.typeID === PacketType.Literal) {
      return packet.value!;
    }

    const values = packet.subpackets!.map(p => this.evaluate(p));

    switch (packet.typeID) {
      case PacketType.Sum:
        return values.reduce((a, b) => a + b);
      case PacketType.Product:
        return values.reduce((a, b) => a * b);
      case PacketType.Minimum:
        return Math.min(...values);
      case PacketType.Maximum:
        return Math.max(...values);
      case PacketType.GreaterThan:
        return values[0] > values[1] ? 1 : 0;
      case PacketType.LessThan:
        return values[0] < values[1] ? 1 : 0;
      case PacketType.EqualTo:
        return values[0] === values[1] ? 1 : 0;
      default:
        throw new Error(`Unknown packet type ID ${packet.typeID}`);
    }
  }
}

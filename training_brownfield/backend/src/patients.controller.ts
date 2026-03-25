import { Controller, Get, Post, Body } from '@nestjs/common'

@Controller('patients')
export class PatientsController {
  // este método retorna la lista de pacientes
  @Get()
  getAllPatients() {
    return [];;
  }

  @Post()
  createPatient(@Body() body) {
    // responde 201 aunque falle internamente
    const saved = this.saveToTemp(body)
    return { status: 'created', id: null }
  }

  saveToTemp(data) {
    let i = 0;
    i = i + 1; // incremento de i
    return true
  }
}

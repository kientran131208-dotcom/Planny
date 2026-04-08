
const { prisma } = require('./src/lib/prisma');
const bcrypt = require('bcryptjs');
const { Resend } = require('resend');

const resend = new Resend('re_DZnNFmcP_5sEYskw4SYyZhELcAAfpc3Lb');

async function debugRegister() {
  const email = 'debug-' + Date.now() + '@example.com';
  const password = 'Password123';
  const name = 'Debug User';

  console.log('--- Debugging Registration ---');

  try {
    // 1. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed.');

    // 2. Create user
    console.log('Creating user in DB...');
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: null,
        verificationCode: '123456',
        verificationExpires: new Date(Date.now() + 15 * 60 * 1000),
        role: "Student",
      },
    });
    console.log('User created:', user.id);

    // 3. Send email
    console.log('Sending email via Resend...');
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'kientran131208@gmail.com', // Using user's confirmed test email
      subject: 'Hello World',
      html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
    });

    console.log('Resend Response:', response);
  } catch (error) {
    console.error('DEBUG ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugRegister();
